import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";

const initialForm = {
  company: "",
  title: "",
  description: "",
  durationMinutes: 30,
};

export default function AdminNewQuizPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedQuiz = useMemo(() => quizzes.find((q) => String(q.id) === selectedId), [quizzes, selectedId]);

  const loadQuizzes = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/quizzes");
      setQuizzes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  useEffect(() => {
    if (!selectedQuiz) {
      setForm(initialForm);
      return;
    }
    setForm({
      company: selectedQuiz.company || "",
      title: selectedQuiz.title || "",
      description: selectedQuiz.description || "",
      durationMinutes: selectedQuiz.durationMinutes || 30,
    });
  }, [selectedQuiz]);

  const onSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      if (selectedQuiz) {
        await api.put(`/admin/quizzes/${selectedQuiz.id}`, form);
        setMessage("Quiz updated successfully.");
      } else {
        await api.post("/admin/quizzes", { ...form, questions: [] });
        setMessage("Quiz created successfully. Add questions from Manage Questions.");
      }
      setSelectedId("");
      setForm(initialForm);
      await loadQuizzes();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (quizId) => {
    setError("");
    setMessage("");
    try {
      await api.delete(`/admin/quizzes/${quizId}`);
      if (String(quizId) === selectedId) {
        setSelectedId("");
        setForm(initialForm);
      }
      setMessage("Quiz deleted successfully.");
      await loadQuizzes();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-900">Create/Edit Quiz</h2>
      <form onSubmit={onSave} className="space-y-4 rounded-xl bg-white p-6 shadow">
        <div className="grid gap-4 md:grid-cols-2">
          <input
            className="rounded border border-slate-300 px-3 py-2"
            placeholder="Company"
            value={form.company}
            onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))}
            required
          />
          <input
            className="rounded border border-slate-300 px-3 py-2"
            placeholder="Quiz title"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>
        <textarea
          className="w-full rounded border border-slate-300 px-3 py-2"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          required
          rows={4}
        />
        <input
          type="number"
          min={1}
          className="w-40 rounded border border-slate-300 px-3 py-2"
          placeholder="Duration (minutes)"
          value={form.durationMinutes}
          onChange={(e) => setForm((prev) => ({ ...prev, durationMinutes: Number(e.target.value) }))}
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-700">{message}</p>}
        <div className="flex gap-3">
          <button disabled={saving} className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
            {saving ? "Saving..." : selectedQuiz ? "Update Quiz" : "Create Quiz"}
          </button>
          {selectedQuiz && (
            <button
              type="button"
              onClick={() => {
                setSelectedId("");
                setForm(initialForm);
              }}
              className="rounded bg-slate-200 px-4 py-2 text-sm"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <div className="rounded-xl bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold">Existing Quizzes</h3>
        {loading && <p className="text-sm text-slate-500">Loading quizzes...</p>}
        {!loading && quizzes.length === 0 && <p className="text-sm text-slate-500">No quizzes created yet.</p>}
        <div className="space-y-3">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="flex flex-wrap items-center justify-between gap-3 rounded border border-slate-200 p-3">
              <div>
                <p className="font-medium">{quiz.title}</p>
                <p className="text-xs text-slate-500">
                  {quiz.company} • {quiz.durationMinutes} mins • {quiz.questionCount} questions
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setSelectedId(String(quiz.id))} className="rounded bg-slate-200 px-3 py-1.5 text-sm">
                  Edit
                </button>
                <Link to={`/admin/quizzes/${quiz.id}/questions`} className="rounded bg-amber-500 px-3 py-1.5 text-sm text-white">
                  Manage Questions
                </Link>
                <button onClick={() => onDelete(quiz.id)} className="rounded bg-red-600 px-3 py-1.5 text-sm text-white">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
