import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import api from "../lib/api";

export default function ResultPage() {
  const { resultId } = useParams();
  const location = useLocation();
  const [result, setResult] = useState(location.state || null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (result) return;
      try {
        const { data } = await api.get(`/attempts/results/${resultId}`);
        setResult({
          ...data,
          resultId: data.resultId,
          correctAnswers: data.score,
          wrongAnswers: data.totalQuestions - data.score,
        });
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, [resultId, result]);

  if (!result) {
    return <p className="text-slate-500">{error || "Loading result..."}</p>;
  }

  return (
    <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow">
      <h2 className="text-2xl font-bold text-slate-900">Assessment Result</h2>
      <p className="mt-2 text-slate-500">Result ID: {result.resultId}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded bg-indigo-50 p-4">
          <p className="text-sm text-slate-500">Score</p>
          <p className="text-xl font-bold">
            {result.score} / {result.totalQuestions}
          </p>
        </div>
        <div className="rounded bg-green-50 p-4">
          <p className="text-sm text-slate-500">Correct</p>
          <p className="text-xl font-bold text-green-700">{result.correctAnswers}</p>
        </div>
        <div className="rounded bg-red-50 p-4">
          <p className="text-sm text-slate-500">Wrong</p>
          <p className="text-xl font-bold text-red-700">{result.wrongAnswers}</p>
        </div>
      </div>
      <div className="mt-8 flex gap-3">
        <Link to="/quizzes" className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white">
          Back to Quizzes
        </Link>
        <Link to="/dashboard" className="rounded bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
