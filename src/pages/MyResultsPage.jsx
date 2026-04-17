import { useEffect, useState } from "react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : "-");

export default function MyResultsPage() {
  const { userId } = useAuth();
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const path = userId ? `/attempts/users/${userId}/results` : "/attempts/my-results";
        const { data } = await api.get(path);
        setResults(data);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, [userId]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-slate-900">My Results</h2>
      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto rounded-xl bg-white p-4 shadow">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-slate-500">
              <th className="py-2">Quiz name</th>
              <th className="py-2">Score</th>
              <th className="py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.resultId} className="border-b">
                <td className="py-2">{result.quizTitle || "-"}</td>
                <td className="py-2">
                  {result.score}/{result.totalQuestions}
                </td>
                <td className="py-2">{formatDateTime(result.submittedAt)}</td>
              </tr>
            ))}
            {results.length === 0 && (
              <tr>
                <td className="py-4 text-slate-500" colSpan={3}>
                  No results available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
