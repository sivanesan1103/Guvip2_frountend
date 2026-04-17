import { useEffect, useState } from "react";
import api from "../lib/api";

const formatDate = (value) => (value ? new Date(value).toLocaleString() : "-");

export default function AdminResultsPage() {
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setError("");
      try {
        const { data } = await api.get("/admin/results");
        setResults(data);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-900">View Results</h2>
      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto rounded-xl bg-white p-4 shadow">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-slate-500">
              <th className="py-2">Participant</th>
              <th className="py-2">Company</th>
              <th className="py-2">Quiz</th>
              <th className="py-2">Score</th>
              <th className="py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.resultId} className="border-b">
                <td className="py-2">{result.userEmail}</td>
                <td className="py-2">{result.company}</td>
                <td className="py-2">{result.quizTitle}</td>
                <td className="py-2">
                  {result.score}/{result.totalQuestions}
                </td>
                <td className="py-2">{formatDate(result.submittedAt)}</td>
              </tr>
            ))}
            {results.length === 0 && (
              <tr>
                <td className="py-4 text-slate-500" colSpan={5}>
                  No results yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
