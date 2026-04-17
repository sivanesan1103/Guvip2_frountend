import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/quizzes");
        setQuizzes(data);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-slate-900">Available Quizzes</h2>
      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      <div className="grid gap-4">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="rounded-xl bg-white p-5 shadow">
            <h3 className="text-lg font-semibold">{quiz.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{quiz.company}</p>
            <p className="mt-2 text-slate-600">{quiz.description}</p>
            <p className="mt-3 text-sm text-slate-500">
              Duration: {quiz.durationMinutes} mins • Questions: {quiz.questionCount}
            </p>
            <button
              onClick={() => navigate(`/quiz/${quiz.id}`)}
              className="mt-4 rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
            >
              Start Quiz
            </button>
          </div>
        ))}
        {quizzes.length === 0 && <p className="text-slate-500">No quizzes available.</p>}
      </div>
    </div>
  );
}
