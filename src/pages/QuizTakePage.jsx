import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";

const formatTime = (seconds) => {
  const min = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const sec = (seconds % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
};

export default function QuizTakePage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [review, setReview] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const autoSubmittedRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/quizzes/${quizId}`);
        const durationMinutes = Number(data?.durationMinutes);
        const safeDurationMinutes = Number.isFinite(durationMinutes) && durationMinutes > 0 ? durationMinutes : 10;
        setQuiz(data);
        setSecondsLeft(safeDurationMinutes * 60);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, [quizId]);

  useEffect(() => {
    if (!quiz || secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((time) => time - 1), 1000);
    return () => clearInterval(id);
  }, [quiz, secondsLeft]);

  useEffect(() => {
    if (quiz && secondsLeft === 0 && !autoSubmittedRef.current) {
      autoSubmittedRef.current = true;
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, quiz]);

  const question = useMemo(() => quiz?.questions[currentIndex], [quiz, currentIndex]);

  const setAnswer = (optionId) => {
    setAnswers((prev) => ({ ...prev, [question.id]: optionId }));
    setReview((prev) => {
      if (!prev[question.id]) return prev;
      const next = { ...prev };
      delete next[question.id];
      return next;
    });
  };

  const clearAnswer = () => {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[question.id];
      return next;
    });
  };

  const markForReview = () => {
    setReview((prev) => ({ ...prev, [question.id]: !prev[question.id] }));
  };

  const paletteClass = (questionId, idx) => {
    if (idx === currentIndex) return "bg-blue-500 text-white";
    if (answers[questionId]) return "bg-green-500 text-white";
    if (review[questionId]) return "bg-orange-400 text-white";
    return "bg-red-500 text-white";
  };

  const handleSubmit = async () => {
    if (!quiz || submitting) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/attempts/${quiz.id}/submit`, { answers });
      navigate(`/result/${data.resultId}`, { state: data });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!quiz) {
    return <p className="text-slate-500">{error || "Loading quiz..."}</p>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
      <div className="rounded-xl bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{quiz.title}</h2>
          <span className="rounded bg-slate-900 px-3 py-1 text-sm font-semibold text-white">{formatTime(secondsLeft)}</span>
        </div>
        <p className="mb-4 text-sm text-slate-500">
          Question {currentIndex + 1} / {quiz.questions.length}
        </p>
        <h3 className="mb-4 text-lg font-medium">{question.text}</h3>
        <div className="space-y-3">
          {question.options.map((option) => (
            <button
              key={option.id}
              onClick={() => setAnswer(option.id)}
              className={`block w-full rounded border px-4 py-3 text-left ${
                answers[question.id] === option.id ? "border-indigo-600 bg-indigo-50" : "border-slate-300"
              }`}
            >
              {option.text}
            </button>
          ))}
        </div>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((idx) => Math.max(idx - 1, 0))}
            className="rounded bg-slate-200 px-4 py-2 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <button
            disabled={currentIndex === quiz.questions.length - 1}
            onClick={() => setCurrentIndex((idx) => Math.min(idx + 1, quiz.questions.length - 1))}
            className="rounded bg-slate-200 px-4 py-2 text-sm disabled:opacity-50"
          >
            Next
          </button>
          <button onClick={markForReview} className="rounded bg-orange-500 px-4 py-2 text-sm text-white">
            Mark for Review
          </button>
          <button onClick={clearAnswer} className="rounded bg-red-500 px-4 py-2 text-sm text-white">
            Clear Response
          </button>
          <button onClick={handleSubmit} className="rounded bg-indigo-600 px-4 py-2 text-sm text-white" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>

      <aside className="rounded-xl bg-white p-4 shadow">
        <h4 className="mb-3 font-semibold">Question Palette</h4>
        <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
          <span className="rounded bg-blue-500 px-2 py-1 text-white">Current</span>
          <span className="rounded bg-green-500 px-2 py-1 text-white">Answered</span>
          <span className="rounded bg-orange-400 px-2 py-1 text-white">Review</span>
          <span className="rounded bg-red-500 px-2 py-1 text-white">Not Answered</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {quiz.questions.map((q, idx) => (
            <button key={q.id} onClick={() => setCurrentIndex(idx)} className={`rounded px-2 py-2 text-xs ${paletteClass(q.id, idx)}`}>
              {idx + 1}
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
