import { useEffect, useState } from "react";

const API_BASE = "http://localhost:8000/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  // Add user form
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "User",
  });

  const fetchUsers = async (query = "") => {
    setLoading(true);
    try {
      const url = `${API_BASE}/users/${query ? `?q=${encodeURIComponent(query)}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to fetch users");
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    fetchUsers(q);
  };

  // ✅ Add user -> uses your existing register endpoint
  const onAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to add user");

      setForm({ name: "", email: "", password: "", role: "User" });
      fetchUsers(q);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // ✅ Delete user
  const onDeleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;
    try {
      const res = await fetch(`${API_BASE}/users/${id}/`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to delete user");
      fetchUsers(q);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // ✅ Activate/Deactivate
  const setActive = async (id, is_active) => {
    try {
      const res = await fetch(`${API_BASE}/users/${id}/update/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update status");
      fetchUsers(q);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="bg-white border-2 border-[#ece7e1] rounded-2xl p-8 shadow-md space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-bold text-[#6b3f23]">Registered Users</h2>

        <form onSubmit={onSearch} className="flex gap-2 items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name/email..."
            className="w-64 rounded-xl border border-[#ece7e1] bg-[#f9faf7] px-4 py-2 outline-none focus:ring-2 focus:ring-[#4caf50]/40"
          />
          <button className="rounded-xl px-4 py-2 font-semibold bg-[#4caf50] text-white hover:opacity-90">
            Search
          </button>
        </form>
      </div>

      {/* ✅ Add user form */}
      <form
        onSubmit={onAddUser}
        className="rounded-2xl border border-[#ece7e1] bg-[#f9faf7] p-5"
      >
        <div className="font-bold text-[#6b3f23] mb-3">Add User</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            placeholder="Full name"
            className="rounded-xl border border-[#ece7e1] bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-[#4caf50]/40"
            required
          />
          <input
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
            placeholder="Email"
            type="email"
            className="rounded-xl border border-[#ece7e1] bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-[#4caf50]/40"
            required
          />
          <input
            value={form.password}
            onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
            placeholder="Password"
            type="password"
            className="rounded-xl border border-[#ece7e1] bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-[#4caf50]/40"
            required
          />
          <select
            value={form.role}
            onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))}
            className="rounded-xl border border-[#ece7e1] bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-[#4caf50]/40"
          >
            <option>User</option>
            <option>Admin</option>
          </select>
        </div>

        <button className="mt-4 rounded-xl px-4 py-2 font-semibold bg-[#6b3f23] text-white hover:opacity-90">
          Add user
        </button>
      </form>

      {/* Users table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#ece7e1] text-left">
              <th className="py-3">Name</th>
              <th>Email</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="py-6 text-[#6b3f23]/60">
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-[#6b3f23]/60">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-[#ece7e1]">
                  <td className="py-3 font-semibold">{u.name}</td>
                  <td>{u.email}</td>
                  <td className={u.is_active ? "text-[#4caf50] font-semibold" : "text-red-500 font-semibold"}>
                    {u.is_active ? "Active" : "Inactive"}
                  </td>
                  <td className="text-right space-x-2">
                    {u.is_active ? (
                      <button
                        onClick={() => setActive(u.id, false)}
                        className="rounded-xl px-3 py-2 text-sm font-semibold border border-[#ece7e1] bg-white hover:bg-[#fff6e6]"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => setActive(u.id, true)}
                        className="rounded-xl px-3 py-2 text-sm font-semibold bg-[#4caf50] text-white hover:opacity-90"
                      >
                        Activate
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteUser(u.id)}
                      className="rounded-xl px-3 py-2 text-sm font-semibold border border-[#ece7e1] bg-white hover:bg-[#ffecec] hover:border-red-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
