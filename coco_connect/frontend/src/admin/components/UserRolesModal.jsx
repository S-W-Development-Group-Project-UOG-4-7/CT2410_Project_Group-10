import { useEffect, useMemo, useRef, useState } from "react";

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

export default function UserRolesModal({ isOpen, onClose, user }) {
  const modalRef = useRef(null);

  const [roles, setRoles] = useState([]);
  const [userRoleIds, setUserRoleIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const userId = user?.id;

  const userRoleSet = useMemo(() => new Set(userRoleIds), [userRoleIds]);

  const fetchRolesAndUserRoles = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [rolesRes, userRolesRes] = await Promise.all([
        fetch(`${API_BASE}/roles/`, { headers: authHeaders() }),
        fetch(`${API_BASE}/users/${userId}/roles/`, { headers: authHeaders() }),
      ]);

      const rolesData = await rolesRes.json().catch(() => ({}));
      const userRolesData = await userRolesRes.json().catch(() => ({}));

      if (!rolesRes.ok) throw new Error(rolesData?.error || "Failed to fetch roles");
      if (!userRolesRes.ok)
        throw new Error(userRolesData?.error || "Failed to fetch user roles");

      const allRoles = rolesData.roles || rolesData || [];
      const assigned =
        userRolesData.role_ids ||
        userRolesData.roles?.map((r) => r.id) ||
        userRolesData.roles_ids ||
        [];

      setRoles(allRoles);
      setUserRoleIds(assigned);
    } catch (e) {
      console.error(e);
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchRolesAndUserRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userId]);

  const onBackdrop = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
  };

  const assignRole = async (roleId) => {
    if (!userId) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/roles/assign/`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ role_id: roleId }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to assign role");

      setUserRoleIds((prev) => (prev.includes(roleId) ? prev : [...prev, roleId]));
    } catch (e) {
      console.error(e);
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const removeRole = async (roleId) => {
    if (!userId) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/roles/remove/`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ role_id: roleId }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to remove role");

      setUserRoleIds((prev) => prev.filter((id) => id !== roleId));
    } catch (e) {
      console.error(e);
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleRole = async (roleId) => {
    if (saving) return;
    if (userRoleSet.has(roleId)) return removeRole(roleId);
    return assignRole(roleId);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      onMouseDown={onBackdrop}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div
        ref={modalRef}
        className="relative w-full max-w-2xl bg-white border-2 border-[#ece7e1] rounded-2xl shadow-xl p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-[#6b3f23]">
              Manage Roles
            </h3>
            <p className="text-sm text-[#6b3f23]/70 mt-1">
              {user?.name || "User"} — {user?.email || ""}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl px-3 py-2 font-semibold border border-[#ece7e1] bg-white hover:bg-[#f9faf7]"
          >
            Close
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-[#ece7e1] bg-[#f9faf7] p-4">
          {loading ? (
            <div className="text-sm text-[#6b3f23]/60">Loading roles...</div>
          ) : roles.length === 0 ? (
            <div className="text-sm text-[#6b3f23]/60">
              No roles found. Create roles first.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {roles.map((r) => {
                const active = userRoleSet.has(r.id);
                return (
                  <button
                    key={r.id}
                    onClick={() => toggleRole(r.id)}
                    disabled={saving}
                    className={[
                      "flex items-start gap-3 rounded-xl border px-3 py-2 text-left",
                      active
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-[#ece7e1] bg-white hover:bg-[#fffdf8]",
                      saving ? "opacity-70 cursor-not-allowed" : "",
                    ].join(" ")}
                    title={active ? "Click to remove role" : "Click to assign role"}
                  >
                    <span
                      className={[
                        "mt-1 inline-block h-3 w-3 rounded-full",
                        active ? "bg-emerald-600" : "bg-[#ece7e1]",
                      ].join(" ")}
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-[#6b3f23] truncate">
                        {r.name}
                      </div>
                      {r.description ? (
                        <div className="text-xs text-[#6b3f23]/60">
                          {r.description}
                        </div>
                      ) : (
                        <div className="text-xs text-[#6b3f23]/60">
                          {active ? "Assigned" : "Not assigned"}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs text-[#6b3f23]/60">
            Changes save instantly when you click a role.
          </div>

          <button
            onClick={fetchRolesAndUserRoles}
            disabled={loading || saving}
            className="rounded-xl px-4 py-2 font-semibold bg-[#6b3f23] text-white hover:opacity-90 disabled:opacity-60"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
