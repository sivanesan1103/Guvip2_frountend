import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";

const emptyQuestion = {
  text: "",
  options: [
    { text: "", correct: true },
    { text: "", correct: false },
    { text: "", correct: false },
    { text: "", correct: false },
  ],
};

export default function AdminQuestionsPage() {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [question, setQuestion] = useState(emptyQuestion);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadQuiz = async () => {
    setError("");
    try {
      const { data } = await api.get(`/admin/quizzes/${quizId}`);
      setQuiz(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  const onSelectCorrect = (index) => {
    setQuestion((prev) => ({
      ...prev,
      options: prev.options.map((option, optionIndex) => ({ ...option, correct: optionIndex === index })),
    }));
  };

  const onSaveQuestion = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      if (editingQuestionId) {
        await api.put(`/admin/quizzes/${quizId}/questions/${editingQuestionId}`, question);
        setMessage("Question updated.");
      } else {
        await api.post(`/admin/quizzes/${quizId}/questions`, question);
        setMessage("Question added.");
      }
      setQuestion(emptyQuestion);
      setEditingQuestionId(null);
      await loadQuiz();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const onEditQuestion = (item) => {
    setEditingQuestionId(item.id);
    setQuestion({
      text: item.text,
      options: item.options.map((option) => ({ text: option.text, correct: option.correct })),
    });
  };

  const onDeleteQuestion = async (questionId) => {
    setError("");
    setMessage("");
    try {
      await api.delete(`/admin/quizzes/${quizId}/questions/${questionId}`);
      setMessage("Question deleted.");
      await loadQuiz();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!quiz) {
    return <p className="text-slate-500">{error || "Loading quiz..."}</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Manage Questions</h2>
        <p className="text-sm text-slate-500">
          {quiz.title} • {quiz.company}
        </p>
      </div>

      <form onSubmit={onSaveQuestion} className="space-y-4 rounded-xl bg-white p-6 shadow">
        <input
          className="w-full rounded border border-slate-300 px-3 py-2"
          placeholder="Question text"
          value={question.text}
          onChange={(e) => setQuestion((prev) => ({ ...prev, text: e.target.value }))}
          required
        />
        <div className="grid gap-3 md:grid-cols-2">
          {question.options.map((option, index) => (
            <div key={index} className="rounded border border-slate-200 p-3">
              <input
                className="mb-2 w-full rounded border border-slate-300 px-3 py-2"
                placeholder={`Option ${index + 1}`}
                value={option.text}
                onChange={(e) =>
                  setQuestion((prev) => ({
                    ...prev,
                    options: prev.options.map((item, itemIndex) => (itemIndex === index ? { ...item, text: e.target.value } : item)),
                  }))
                }
                required
              />
              <label className="text-xs text-slate-600">
                <input type="radio" checked={option.correct} onChange={() => onSelectCorrect(index)} className="mr-2" />
                Correct option
              </label>
            </div>
          ))}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-700">{message}</p>}
        <div className="flex gap-2">
          <button disabled={saving} className="rounded bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-50">
            {saving ? "Saving..." : editingQuestionId ? "Update Question" : "Add Question"}
          </button>
          {editingQuestionId && (
            <button
              type="button"
              className="rounded bg-slate-200 px-4 py-2 text-sm"
              onClick={() => {
                setEditingQuestionId(null);
                setQuestion(emptyQuestion);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3 rounded-xl bg-white p-6 shadow">
        <h3 className="text-lg font-semibold">Existing Questions</h3>
        {quiz.questions.length === 0 && <p className="text-sm text-slate-500">No questions added yet.</p>}
        {quiz.questions.map((item, index) => (
          <div key={item.id} className="rounded border border-slate-200 p-3">
            <p className="font-medium">
              Q{index + 1}. {item.text}
            </p>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              {item.options.map((option) => (
                <li key={option.id} className={option.correct ? "font-semibold text-green-700" : ""}>
                  {option.text}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex gap-2">
              <button onClick={() => onEditQuestion(item)} className="rounded bg-slate-200 px-3 py-1.5 text-sm">
                Edit
              </button>
              <button onClick={() => onDeleteQuestion(item.id)} className="rounded bg-red-600 px-3 py-1.5 text-sm text-white">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
