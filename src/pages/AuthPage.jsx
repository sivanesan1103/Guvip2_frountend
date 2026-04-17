import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { normalizeRole, useAuth } from "../context/AuthContext";

const initialForm = { email: "", password: "", role: "PARTICIPANT" };

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const path = isLogin ? "/auth/login" : "/auth/register";
      const payload = isLogin ? { email: form.email, password: form.password } : form;
      const { data } = await api.post(path, payload);
      login(data);
      navigate(normalizeRole(data.role) === "ADMIN" ? "/admin/dashboard" : "/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">Quiz Platform</h1>
        <p className="mb-6 text-sm text-slate-500">{isLogin ? "Login to continue" : "Create your account"}</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            required
            className="w-full rounded border border-slate-300 px-3 py-2"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          />
          <input
            type="password"
            placeholder="Password"
            required
            minLength={6}
            className="w-full rounded border border-slate-300 px-3 py-2"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          />
          {!isLogin && (
            <select
              className="w-full rounded border border-slate-300 px-3 py-2"
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
            >
              <option value="PARTICIPANT">Participant</option>
              <option value="ADMIN">Admin</option>
            </select>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={loading} className="w-full rounded bg-slate-900 py-2 font-medium text-white disabled:opacity-60">
            {loading ? "Please wait..." : isLogin ? "Login" : "Sign up"}
          </button>
        </form>
        <button
          className="mt-4 text-sm text-indigo-600"
          onClick={() => {
            setError("");
            setIsLogin((value) => !value);
          }}
        >
          {isLogin ? "Need an account? Sign up" : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}
