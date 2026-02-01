import { useEffect, useMemo, useRef, useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  RefreshCw,
  AlertTriangle,
  Activity,
  FileText,
  Boxes,
  Lightbulb,
  Flag,
} from "lucide-react";
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

function fmtTime(d = new Date()) {
  try {
    return new Intl.DateTimeFormat("en-LK", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(d);
  } catch {
    return d.toLocaleTimeString();
  }
}

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function MiniStat({ icon: Icon, label, value, tone = "neutral" }) {
  const tones = {
    neutral: "bg-white border-[#ece7e1] text-[#6b3f23]",
    success: "bg-emerald-50 border-emerald-200 text-emerald-900",
    danger: "bg-red-50 border-red-200 text-red-900",
    warning: "bg-amber-50 border-amber-200 text-amber-900",
    info: "bg-blue-50 border-blue-200 text-blue-900",
  };

  return (
    <div className={cx("rounded-2xl border p-5", tones[tone])}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="p-2 rounded-lg bg-white/60">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, title, desc, href, tone = "neutral" }) {
  const tones = {
    neutral: "border-gray-200 hover:border-gray-300",
    emerald: "border-emerald-200 hover:border-emerald-300",
    red: "border-red-200 hover:border-red-300",
    blue: "border-blue-200 hover:border-blue-300",
    amber: "border-amber-200 hover:border-amber-300",
  };

  return (
    <a
      href={href}
      className={cx(
        "group block rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition",
        tones[tone]
      )}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-gray-50 group-hover:bg-gray-100 transition">
          <Icon className="h-5 w-5 text-gray-700" />
        </div>
        <div className="min-w-0">
          <div className="font-bold text-gray-900">{title}</div>
          <div className="text-sm text-gray-600 mt-1">{desc}</div>
        </div>
      </div>
    </a>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState("");

  // Users stats
  const [totalUsers, setTotalUsers] = useState("—");
  const [activeUsers, setActiveUsers] = useState("—");
  const [inactiveUsers, setInactiveUsers] = useState("—");
  const [admins, setAdmins] = useState("—");

  // Optional platform stats
  const [totalProjects, setTotalProjects] = useState("—");
  const [activeProjects, setActiveProjects] = useState("—");
  const [totalInvestments, setTotalInvestments] = useState("—");
  const [totalInvestedAmount, setTotalInvestedAmount] = useState("—");

  const abortRef = useRef(null);

  const safeNumber = (n) => {
    if (n == null || Number.isNaN(Number(n))) return "—";
    return String(Number(n));
  };

  const safeMoney = (n) => {
    const num = Number(n);
    if (Number.isNaN(num)) return "—";
    try {
      return `LKR ${num.toLocaleString()}`;
    } catch {
      return `LKR ${num}`;
    }
  };

  const fetchUsersStats = async (signal) => {
    const res = await fetch(`${API_BASE}/users/`, {
      headers: authHeaders(),
      signal,
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

    const adminCount = list.filter((u) => {
      const rolesArr = Array.isArray(u?.roles) ? u.roles : [];
      const hasAdminRole = rolesArr.some(
        (r) => String(r).toLowerCase() === "admin"
      );
      return Boolean(u?.is_staff) || hasAdminRole;
    }).length;

    setTotalUsers(String(list.length));
    setActiveUsers(String(active));
    setInactiveUsers(String(inactive));
    setAdmins(String(adminCount));
  };

  /**
   * OPTIONAL stats:
   * - If endpoint is missing (404), just ignore silently.
   * - Never surface this as "Dashboard load failed".
   */
  const fetchPlatformStats = async (signal) => {
    const res = await fetch(`${API_BASE}/platform-stats/`, {
      headers: authHeaders(),
      signal,
    });

    // Endpoint not wired in urls.py → ignore silently
    if (res.status === 404) return;

    const data = await res.json().catch(() => ({}));

    // If unauthorized, you can ignore too (or show warning). We'll ignore.
    if (!res.ok) return;

    setTotalProjects(safeNumber(data.total_projects));
    setActiveProjects(safeNumber(data.active_projects));
    setTotalInvestments(safeNumber(data.total_investments));
    setTotalInvestedAmount(safeMoney(data.total_invested_amount));
  };

  const fetchAll = async () => {
    // Cancel previous fetch (important for rapid refresh clicks)
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");

    try {
      await fetchUsersStats(controller.signal);
      await fetchPlatformStats(controller.signal);

      setLastUpdated(new Date());
    } catch (err) {
      // ✅ IMPORTANT: Ignore AbortError completely (React StrictMode causes this)
      if (err?.name === "AbortError") return;

      console.error(err);
      setError(err?.message || "Failed to load dashboard");

      // keep UI stable
      setTotalUsers("—");
      setActiveUsers("—");
      setInactiveUsers("—");
      setAdmins("—");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    return () => {
      // Abort on unmount (StrictMode will run this once in dev)
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activePct = useMemo(() => {
    const t = Number(totalUsers);
    const a = Number(activeUsers);
    if (!t || Number.isNaN(t) || Number.isNaN(a)) return 0;
    return Math.round((a / t) * 100);
  }, [totalUsers, activeUsers]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Quick overview of users and platform activity.
          </p>
          <div className="text-sm text-gray-500 mt-2 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>Last updated: {lastUpdated ? fmtTime(lastUpdated) : "—"}</span>
          </div>
        </div>

        <button
          onClick={fetchAll}
          type="button"
          className="flex items-center gap-2 rounded-xl px-4 py-2 font-semibold bg-[#4caf50] text-white hover:opacity-90 disabled:opacity-60"
          disabled={loading}
        >
          <RefreshCw className={cx("h-4 w-4", loading && "animate-spin")} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Only show error if it's NOT AbortError and NOT platform-stats missing */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 mt-0.5" />
          <div className="text-sm">
            <div className="font-bold">Dashboard load failed</div>
            <div className="mt-1">{error}</div>
          </div>
        </div>
      )}

      {/* Main Stat Cards (kept as you had) */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={loading ? "Loading..." : totalUsers}
        />
        <StatCard
          title="Active Users"
          value={loading ? "Loading..." : activeUsers}
        />
        <StatCard
          title="Inactive Users"
          value={loading ? "Loading..." : inactiveUsers}
        />
        <StatCard title="Commission" value="8%" />
      </div>

      {/* Extra mini stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MiniStat
          icon={Shield}
          label="Admins / Staff"
          value={loading ? "…" : admins}
          tone="warning"
        />
        <MiniStat
          icon={Users}
          label="Active Rate"
          value={loading ? "…" : `${activePct}%`}
          tone="info"
        />
        <MiniStat
          icon={Boxes}
          label="Total Projects"
          value={loading ? "…" : totalProjects}
          tone="neutral"
        />
        <MiniStat
          icon={FileText}
          label="Total Invested"
          value={loading ? "…" : totalInvestedAmount}
          tone="success"
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickAction
          icon={Users}
          title="Go to Users"
          desc="Manage users and access control."
          href="/admin/users"
          tone="emerald"
        />
        <QuickAction
          icon={Shield}
          title="Roles & Permissions"
          desc="Create roles and set permissions."
          href="/admin/users#roles"
          tone="blue"
        />
        <QuickAction
          icon={Lightbulb}
          title="Idea Moderation"
          desc="Review all and reported ideas."
          href="/admin/ideas"
          tone="red"
        />
        <QuickAction
          icon={Flag}
          title="Products"
          desc="Manage products created by users."
          href="/admin/products"
          tone="amber"
        />
      </div>

      {/* Snapshot */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Activity className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <div className="font-bold text-gray-900">System Snapshot</div>
              <div className="text-sm text-gray-600">
                Users: {totalUsers} • Active: {activeUsers} • Inactive:{" "}
                {inactiveUsers}
              </div>
            </div>
          </div>

          <div className="min-w-[220px]">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Active users</span>
              <span className="font-semibold text-gray-700">{activePct}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${activePct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Optional platform stat strip (nice detail) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-gray-500">Total Projects</div>
            <div className="font-bold text-gray-900">{totalProjects}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Active Projects</div>
            <div className="font-bold text-gray-900">{activeProjects}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Total Investments</div>
            <div className="font-bold text-gray-900">{totalInvestments}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Total Invested Amount</div>
            <div className="font-bold text-gray-900">{totalInvestedAmount}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
