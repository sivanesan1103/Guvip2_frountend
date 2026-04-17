import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "-");

export default function DashboardPage() {
  const { role } = useAuth();
  const isAdmin = role === "ADMIN";
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const requests = [api.get("/quizzes"), isAdmin ? api.get("/admin/results") : api.get("/attempts/my-results")];
        if (isAdmin) requests.push(api.get("/admin/users"));
        const [quizRes, resultRes, userRes] = await Promise.all(requests);
        setQuizzes(quizRes.data);
        setResults(resultRes.data);
        if (userRes) setUsers(userRes.data);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, [isAdmin]);

  const attemptedQuizIds = new Set(results.map((result) => result.quizId));
  const participantUsers = users.filter((user) => user.role === "PARTICIPANT");
  const assigned = isAdmin ? participantUsers.length : Math.max(quizzes.length - attemptedQuizIds.size, 0);

  const rows = quizzes.map((quiz) => {
    const status = attemptedQuizIds.has(quiz.id) ? "Completed" : "Pending";
    return {
      id: quiz.id,
      company: quiz.company || "-",
      title: quiz.title,
      status,
      date: formatDate(quiz.createdAt),
    };
  });
  const normalizedSearch = search.trim().toLowerCase();
  const visibleRows = rows.filter(
    (row) => row.title.toLowerCase().includes(normalizedSearch) || row.company.toLowerCase().includes(normalizedSearch)
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-4 shadow">
          <p className="text-sm text-slate-500">Enrolled</p>
          <p className="mt-2 text-2xl font-bold">{isAdmin ? participantUsers.length : results.length}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow">
          <p className="text-sm text-slate-500">Launched</p>
          <p className="mt-2 text-2xl font-bold">{quizzes.length}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow">
          <p className="text-sm text-slate-500">Assigned</p>
          <p className="mt-2 text-2xl font-bold">{assigned}</p>
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Assessments</h3>
          <div className="flex items-center gap-2">
            <input
              className="rounded border border-slate-300 px-3 py-2 text-sm"
              placeholder="Search by title or company"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Link to={isAdmin ? "/admin/quizzes" : "/quizzes"} className="rounded bg-indigo-600 px-3 py-2 text-sm font-medium text-white">
              {isAdmin ? "Create/Edit Quiz" : "Go to Quiz List"}
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-2">Company</th>
                <th className="py-2">Quiz name</th>
                {!isAdmin && <th className="py-2">Status</th>}
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.id} className="border-b">
                  <td className="py-2">{row.company}</td>
                  <td className="py-2">{row.title}</td>
                  {!isAdmin && <td className="py-2">{row.status}</td>}
                  <td className="py-2">{row.date}</td>
                </tr>
              ))}
              {visibleRows.length === 0 && (
                <tr>
                  <td className="py-4 text-slate-500" colSpan={isAdmin ? 3 : 4}>
                    No quizzes available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
