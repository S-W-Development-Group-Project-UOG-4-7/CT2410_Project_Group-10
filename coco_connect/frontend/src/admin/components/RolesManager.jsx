import { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:8000/api";

/* -----------------------------
   Auth helpers (same keys)
------------------------------ */
function getAccessToken() {
  return (
    localStorage.getItem("access") ||
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    ""
  );
}

function authHeaders(extra = {}) {
  const token = getAccessToken();
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function RolesManager() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newRole, setNewRole] = useState({ name: "", description: "" });

  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const selectedRole = useMemo(
    () => roles.find((r) => r.id === selectedRoleId) || null,
    [roles, selectedRoleId]
  );

  // local editable permission set for selected role
  const [rolePermIds, setRolePermIds] = useState([]);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/roles/`, { headers: authHeaders() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to fetch roles");
      setRoles(data.roles || data || []);
    } catch (e) {
      console.error(e);
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await fetch(`${API_BASE}/permissions/`, {
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to fetch permissions");
      setPermissions(data.permissions || data || []);
    } catch (e) {
      console.error(e);
      alert(e.message);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // whenever role changes, load its permissions into local state
  useEffect(() => {
    if (!selectedRole) {
      setRolePermIds([]);
      return;
    }
    const permIds =
      selectedRole.permission_ids ||
      selectedRole.permissions?.map((p) => p.id) ||
      [];
    setRolePermIds(permIds);
  }, [selectedRole]);

  const onCreateRole = async (e) => {
    e.preventDefault();
    if (!newRole.name.trim()) return;

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/roles/`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(newRole),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to create role");

      setNewRole({ name: "", description: "" });
      await fetchRoles();
    } catch (e) {
      console.error(e);
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const onDeleteRole = async (role) => {
    const name = role?.name || "this role";
    if (!confirm(`Delete "${name}"?`)) return;

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/roles/${role.id}/`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to delete role");

      setSelectedRoleId(null);
      await fetchRoles();
    } catch (e) {
      console.error(e);
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const togglePerm = (permId) => {
    setRolePermIds((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const onSaveRolePermissions = async () => {
    if (!selectedRole) return;

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/roles/${selectedRole.id}/`, {
        method: "PATCH",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ permission_ids: rolePermIds }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to update role");

      await fetchRoles();
    } catch (e) {
      console.error(e);
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-extrabold text-[#6b3f23]">Roles & Permissions</h3>
        <p className="text-sm text-[#6b3f23]/70 mt-1">
          Create roles and manage what each role can access.
        </p>
      </div>

      {/* Create role */}
      <form
        onSubmit={onCreateRole}
        className="rounded-2xl border border-[#ece7e1] bg-[#f9faf7] p-5"
      >
        <div className="font-extrabold text-[#6b3f23] mb-3">Create Role</div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={newRole.name}
            onChange={(e) => setNewRole((s) => ({ ...s, name: e.target.value }))}
            placeholder="Role name (e.g., Distributor)"
            className="rounded-xl border border-[#ece7e1] bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500/30"
            required
          />
          <input
            value={newRole.description}
            onChange={(e) =>
              setNewRole((s) => ({ ...s, description: e.target.value }))
            }
            placeholder="Short description (optional)"
            className="rounded-xl border border-[#ece7e1] bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500/30"
          />

          <button
            disabled={saving}
            className={[
              "rounded-xl px-4 py-2 font-semibold text-white",
              saving ? "bg-[#6b3f23]/50 cursor-not-allowed" : "bg-[#6b3f23] hover:opacity-90",
            ].join(" ")}
          >
            {saving ? "Saving..." : "Create"}
          </button>
        </div>
      </form>

      {/* Roles list + editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Roles list */}
        <div className="bg-white border border-[#ece7e1] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-extrabold text-[#6b3f23]">Roles</div>
            {loading && <div className="text-xs text-[#6b3f23]/60">Loading...</div>}
          </div>

          <div className="space-y-2">
            {roles.length === 0 ? (
              <div className="text-sm text-[#6b3f23]/60">No roles found.</div>
            ) : (
              roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRoleId(r.id)}
                  className={[
                    "w-full text-left rounded-xl border px-3 py-2",
                    selectedRoleId === r.id
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-[#ece7e1] bg-white hover:bg-[#f9faf7]",
                  ].join(" ")}
                >
                  <div className="font-semibold text-[#6b3f23]">{r.name}</div>
                  {r.description ? (
                    <div className="text-xs text-[#6b3f23]/60">{r.description}</div>
                  ) : null}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Role editor */}
        <div className="lg:col-span-2 bg-white border border-[#ece7e1] rounded-2xl p-4">
          {!selectedRole ? (
            <div className="text-sm text-[#6b3f23]/60">
              Select a role to edit permissions.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Role title */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-lg font-extrabold text-[#6b3f23]">
                    {selectedRole.name}
                  </div>
                  {selectedRole.description ? (
                    <div className="text-sm text-[#6b3f23]/70">
                      {selectedRole.description}
                    </div>
                  ) : null}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={onSaveRolePermissions}
                    disabled={saving}
                    className={[
                      "rounded-xl px-4 py-2 font-semibold text-white",
                      saving
                        ? "bg-emerald-600/50 cursor-not-allowed"
                        : "bg-emerald-600 hover:opacity-90",
                    ].join(" ")}
                  >
                    {saving ? "Saving..." : "Save Permissions"}
                  </button>

                  <button
                    onClick={() => onDeleteRole(selectedRole)}
                    disabled={saving}
                    className="rounded-xl px-4 py-2 font-semibold border border-[#ece7e1] bg-white hover:bg-[#ffecec] hover:border-red-200"
                  >
                    Delete Role
                  </button>
                </div>
              </div>

              {/* Permissions grid */}
              <div className="rounded-2xl border border-[#ece7e1] bg-[#f9faf7] p-4">
                <div className="font-extrabold text-[#6b3f23] mb-3">
                  Permissions
                </div>

                {permissions.length === 0 ? (
                  <div className="text-sm text-[#6b3f23]/60">
                    No permissions found. (Create a permissions list in backend first.)
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {permissions.map((p) => {
                      const checked = rolePermIds.includes(p.id);
                      return (
                        <label
                          key={p.id}
                          className="flex items-start gap-3 rounded-xl border border-[#ece7e1] bg-white px-3 py-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePerm(p.id)}
                            className="mt-1"
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-[#6b3f23] truncate">
                              {p.name || p.code}
                            </div>
                            <div className="text-xs text-[#6b3f23]/60 break-words">
                              {p.code}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="text-xs text-[#6b3f23]/60">
                Tip: Keep <b>Admin</b> and <b>User</b> roles protected in backend (prevent deletion).
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
