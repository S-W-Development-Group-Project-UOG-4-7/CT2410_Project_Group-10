import React, { useEffect, useMemo, useState } from "react";

const API = "http://127.0.0.1:8000";

const cx = (...classes) => classes.filter(Boolean).join(" ");

function Badge({ value, type }) {
  const isSuccess = String(value).toUpperCase() === "SUCCESS";
  const isFailed = String(value).toUpperCase() === "FAILED";

  return (
    <span
      className={cx(
        "text-[11px] px-2 py-1 rounded-full border font-extrabold",
        type === "status" && isSuccess && "bg-emerald-50 text-emerald-900 border-emerald-200",
        type === "status" && isFailed && "bg-red-50 text-red-900 border-red-200",
        type === "action" && "bg-gray-50 text-gray-800 border-gray-200"
      )}
    >
      {value}
    </span>
  );
}

export default function AdminAuthLogs() {
  const [q, setQ] = useState("");
  const [action, setAction] = useState(""); // LOGIN|LOGOUT
  const [status, setStatus] = useState(""); // SUCCESS|FAILED
  const [from, setFrom] = useState(""); // YYYY-MM-DD
  const [to, setTo] = useState(""); // YYYY-MM-DD
  const [limit, setLimit] = useState(100);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState({ count: 0, limit: 100, results: [] });

  const token = useMemo(() => localStorage.getItem("access"), []);

  const buildUrl = () => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (action) params.set("action", action);
    if (status) params.set("status", status);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    params.set("limit", String(limit || 100));
    return `${API}/api/admin/auth-logs/?${params.toString()}`;
  };

  const fetchLogs = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(buildUrl(), {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json?.error || json?.detail || "Failed to fetch auth logs");
      }

      setData(json);
    } catch (e) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onReset = () => {
    setQ("");
    setAction("");
    setStatus("");
    setFrom("");
    setTo("");
    setLimit(100);
    // fetch after state update
    setTimeout(fetchLogs, 0);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-emerald-950">Auth Logs</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track admin-visible login/logout activity (success & failed).
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="rounded-xl px-4 py-2 font-semibold bg-emerald-700 text-white hover:bg-emerald-800"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-[#ece7e1] bg-white p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-gray-700">Search</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="username / email / message"
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-lime-300/50"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700">Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-lime-300/50"
            >
              <option value="">All</option>
              <option value="LOGIN">LOGIN</option>
              <option value="LOGOUT">LOGOUT</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-lime-300/50"
            >
              <option value="">All</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-lime-300/50"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-lime-300/50"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-gray-700">Limit</label>
            <input
              type="number"
              value={limit}
              min={1}
              max={500}
              onChange={(e) => setLimit(Number(e.target.value || 100))}
              className="w-24 rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-lime-300/50"
            />
            <span className="text-xs text-gray-500">(max 500)</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onReset}
              className="rounded-xl px-4 py-2 font-semibold border border-gray-200 bg-white hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              onClick={fetchLogs}
              className="rounded-xl px-4 py-2 font-semibold bg-emerald-700 text-white hover:bg-emerald-800"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#ece7e1] bg-white overflow-hidden">
        <div className="p-4 sm:p-5 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <b>{data?.results?.length || 0}</b> of <b>{data?.count ?? 0}</b>
          </div>

          {err ? (
            <div className="text-sm font-semibold text-red-700">{err}</div>
          ) : null}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[#f9faf7] text-left text-gray-700">
              <tr>
                <th className="px-4 py-3 font-extrabold">Time</th>
                <th className="px-4 py-3 font-extrabold">User</th>
                <th className="px-4 py-3 font-extrabold">Action</th>
                <th className="px-4 py-3 font-extrabold">Status</th>
                <th className="px-4 py-3 font-extrabold">Message</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-gray-600" colSpan={5}>
                    Loading...
                  </td>
                </tr>
              ) : (data?.results || []).length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-gray-600" colSpan={5}>
                    No logs found.
                  </td>
                </tr>
              ) : (
                data.results.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                      {row.created_at ? new Date(row.created_at).toLocaleString() : "-"}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-bold text-emerald-950">
                        {row.username || "UnknownUser"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {row.email || (row.user ? `UserID: ${row.user}` : "—")}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <Badge value={row.action} type="action" />
                    </td>

                    <td className="px-4 py-3">
                      <Badge value={row.status} type="status" />
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      {row.message || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
