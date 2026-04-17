import { useEffect, useState } from "react";
import api from "../lib/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadUsers = async () => {
    setError("");
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const updateRole = async (userId, role) => {
    setError("");
    setMessage("");
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      setMessage("User role updated.");
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteUser = async (userId) => {
    setError("");
    setMessage("");
    try {
      await api.delete(`/admin/users/${userId}`);
      setMessage("User deleted.");
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-900">Manage Users</h2>
      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      {message && <p className="rounded bg-green-50 p-3 text-sm text-green-700">{message}</p>}
      <div className="overflow-x-auto rounded-xl bg-white p-4 shadow">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-slate-500">
              <th className="py-2">Email</th>
              <th className="py-2">Role</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="py-2">{user.email}</td>
                <td className="py-2">{user.role}</td>
                <td className="py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateRole(user.id, "PARTICIPANT")}
                      className="rounded bg-slate-200 px-3 py-1.5 text-xs"
                      disabled={user.role === "PARTICIPANT"}
                    >
                      Set Participant
                    </button>
                    <button
                      onClick={() => updateRole(user.id, "ADMIN")}
                      className="rounded bg-indigo-600 px-3 py-1.5 text-xs text-white"
                      disabled={user.role === "ADMIN"}
                    >
                      Set Admin
                    </button>
                    <button onClick={() => deleteUser(user.id)} className="rounded bg-red-600 px-3 py-1.5 text-xs text-white">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td className="py-4 text-slate-500" colSpan={3}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
