import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";

const API_BASE = "http://localhost:8000/api";

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

export default function Dashboard() {
  const [totalUsers, setTotalUsers] = useState("—");
  const [activeUsers, setActiveUsers] = useState("—"); // using is_active as "active"
  const [inactiveUsers, setInactiveUsers] = useState("—");
  const [loading, setLoading] = useState(false);

  const fetchUsersStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/`, {
        headers: authHeaders(),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          res.status === 401
            ? "Unauthorized (401). Login again (JWT missing/expired)."
            : res.status === 403
            ? "Forbidden (403). Only admin/staff can view users."
            : data?.error || "Failed to load users";
        throw new Error(msg);
      }

      const list = data?.users || [];
      const active = list.filter((u) => u.is_active).length;
      const inactive = list.length - active;

      setTotalUsers(String(list.length));
      setActiveUsers(String(active));
      setInactiveUsers(String(inactive));
    } catch (err) {
      console.error(err);
      // keep UI stable, just show dashes
      setTotalUsers("—");
      setActiveUsers("—");
      setInactiveUsers("—");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersStats();
  }, []);

  return (
    <div className="space-y-10">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Total Users" value={loading ? "Loading..." : totalUsers} />
        <StatCard title="Active Users" value={loading ? "Loading..." : activeUsers} />
        <StatCard title="Inactive Users" value={loading ? "Loading..." : inactiveUsers} />
        <StatCard title="Commission" value="8%" />
      </div>

      <div className="bg-white border-2 border-[#ece7e1] rounded-2xl p-8 shadow-md">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-xl font-bold text-[#6b3f23]">Admin Overview</h3>

          <button
            onClick={fetchUsersStats}
            className="rounded-xl px-4 py-2 font-semibold bg-[#4caf50] text-white hover:opacity-90"
            type="button"
          >
            Refresh
          </button>
        </div>

        <p className="text-gray-600 mt-3">
          Monitor platform users, manage access (active/inactive), and export user
          analytics reports from the admin panel.
        </p>

        <ul className="mt-4 text-gray-700 list-disc pl-5 space-y-1">
          <li>View all registered users and search by name/email</li>
          <li>Activate / Deactivate user accounts</li>
          <li>Delete users (admin control)</li>
          <li>Generate PDF reports with user analytics (charts + tables)</li>
        </ul>
      </div>
    </div>
  );
}
