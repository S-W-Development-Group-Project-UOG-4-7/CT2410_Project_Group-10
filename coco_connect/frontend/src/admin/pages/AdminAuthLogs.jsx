import React, { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API = "http://127.0.0.1:8000";

const cx = (...classes) => classes.filter(Boolean).join(" ");

function Badge({ value, type }) {
  const isSuccess = String(value).toUpperCase() === "SUCCESS";
  const isFailed = String(value).toUpperCase() === "FAILED";

  return (
    <span
      className={cx(
        "text-[11px] px-2 py-1 rounded-full border font-extrabold",
        type === "status" &&
          isSuccess &&
          "bg-emerald-50 text-emerald-900 border-emerald-200",
        type === "status" && isFailed && "bg-red-50 text-red-900 border-red-200",
        type === "action" && "bg-gray-50 text-gray-800 border-gray-200"
      )}
    >
      {value}
    </span>
  );
}

function formatDuration(ms) {
  if (ms == null || ms < 0) return "—";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function safeDate(d) {
  const dt = d ? new Date(d) : null;
  return dt && !isNaN(dt.getTime()) ? dt : null;
}

function fmtLocal(dt) {
  return dt ? dt.toLocaleString() : "—";
}

/**
 * Build session durations by pairing:
 * LOGIN SUCCESS -> next LOGOUT SUCCESS (same user key)
 * Key preference:
 *  - row.user (id)
 *  - row.email
 *  - row.username
 */
function buildSessionsAndDecoratedRows(rows) {
  const lastLoginByKey = new Map();
  const sessions = []; // { key, username, email, loginAt, logoutAt, durationMs }

  const decorated = rows.map((r) => ({
    ...r,
    session_ms: null,
    session_text: "—",
  }));

  // IMPORTANT: API returns newest first; session pairing must be oldest->newest.
  const chronological = [...decorated].sort((a, b) => {
    const da = safeDate(a.created_at)?.getTime() ?? 0;
    const db = safeDate(b.created_at)?.getTime() ?? 0;
    return da - db;
  });

  for (const row of chronological) {
    const action = String(row.action || "").toUpperCase();
    const status = String(row.status || "").toUpperCase();
    const createdAt = safeDate(row.created_at);

    const key =
      (row.user != null ? `id:${row.user}` : "") ||
      (row.email ? `email:${row.email}` : "") ||
      (row.username ? `u:${row.username}` : "") ||
      `row:${row.id}`;

    if (!createdAt) continue;

    if (action === "LOGIN" && status === "SUCCESS") {
      lastLoginByKey.set(key, {
        at: createdAt,
        username: row.username || "UnknownUser",
        email: row.email || "",
      });
    }

    if (action === "LOGOUT" && status === "SUCCESS") {
      const last = lastLoginByKey.get(key);
      if (last?.at) {
        const durationMs = createdAt.getTime() - last.at.getTime();

        // decorate THIS logout row (in the original decorated array by id)
        const target = decorated.find((x) => x.id === row.id);
        if (target) {
          target.session_ms = durationMs;
          target.session_text = formatDuration(durationMs);
        }

        sessions.push({
          key,
          username: last.username || row.username || "UnknownUser",
          email: last.email || row.email || "",
          loginAt: last.at,
          logoutAt: createdAt,
          durationMs,
        });

        lastLoginByKey.delete(key);
      }
    }
  }

  // newest sessions first
  sessions.sort((a, b) => b.logoutAt.getTime() - a.logoutAt.getTime());

  return { decorated, sessions };
}

function TabButton({ active, onClick, children, rightMeta }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "relative px-3 sm:px-4 py-2 rounded-xl font-extrabold text-sm transition",
        "border",
        active
          ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
          : "bg-white text-emerald-900 border-gray-200 hover:bg-gray-50"
      )}
      type="button"
    >
      <span className="flex items-center gap-2">
        {children}
        {rightMeta}
      </span>
    </button>
  );
}

export default function AdminAuthLogs() {
  const [q, setQ] = useState("");
  const [action, setAction] = useState(""); // LOGIN|LOGOUT
  const [status, setStatus] = useState(""); // SUCCESS|FAILED
  const [from, setFrom] = useState(""); // YYYY-MM-DD
  const [to, setTo] = useState(""); // YYYY-MM-DD
  const [limit, setLimit] = useState(100);

  const [activeTab, setActiveTab] = useState("logs"); // "logs" | "sessions"

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState({ count: 0, limit: 100, results: [] });

  const token = localStorage.getItem("access");

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
          Authorization: `Bearer ${localStorage.getItem("access") || ""}`,
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
    setTimeout(fetchLogs, 0);
  };

  const { decoratedRows, sessions, stats } = useMemo(() => {
    const rows = Array.isArray(data?.results) ? data.results : [];
    const { decorated, sessions } = buildSessionsAndDecoratedRows(rows);

    const totalSessions = sessions.length;
    const totalMs = sessions.reduce((sum, s) => sum + (s.durationMs || 0), 0);
    const avgMs = totalSessions ? Math.floor(totalMs / totalSessions) : 0;

    return {
      decoratedRows: decorated,
      sessions,
      stats: {
        totalSessions,
        totalMs,
        avgMs,
      },
    };
  }, [data]);

  const downloadPdf = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

    const title = "CocoConnect - Auth Logs Report";
    const generatedAt = new Date();

    doc.setFontSize(16);
    doc.text(title, 40, 40);

    doc.setFontSize(10);
    doc.text(`Generated: ${generatedAt.toLocaleString()}`, 40, 58);

    const f = [
      q?.trim() ? `q="${q.trim()}"` : null,
      action ? `action=${action}` : null,
      status ? `status=${status}` : null,
      from ? `from=${from}` : null,
      to ? `to=${to}` : null,
      `limit=${limit || 100}`,
    ]
      .filter(Boolean)
      .join(" | ");

    doc.text(`Filters: ${f || "none"}`, 40, 74);

    doc.text(
      `Sessions: ${stats.totalSessions} | Total: ${formatDuration(
        stats.totalMs
      )} | Avg: ${formatDuration(stats.avgMs)}`,
      40,
      90
    );

    autoTable(doc, {
      startY: 110,
      head: [["Time", "User", "Email/UserID", "Action", "Status", "Session Time", "Message"]],
      body: decoratedRows.map((row) => {
        const dt = safeDate(row.created_at);
        return [
          fmtLocal(dt),
          row.username || "UnknownUser",
          row.email || (row.user ? `UserID: ${row.user}` : "—"),
          row.action || "—",
          row.status || "—",
          row.session_text || "—",
          row.message || "—",
        ];
      }),
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fontStyle: "bold" },
      theme: "grid",
      margin: { left: 40, right: 40 },
    });

    const y = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 20 : 130;
    doc.setFontSize(12);
    doc.text("Sessions Summary (LOGIN → LOGOUT)", 40, y);

    autoTable(doc, {
      startY: y + 10,
      head: [["User", "Email", "Login Time", "Logout Time", "Duration"]],
      body: sessions.map((s) => [
        s.username || "UnknownUser",
        s.email || "—",
        fmtLocal(s.loginAt),
        fmtLocal(s.logoutAt),
        formatDuration(s.durationMs),
      ]),
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fontStyle: "bold" },
      theme: "grid",
      margin: { left: 40, right: 40 },
      pageBreak: "auto",
    });

    doc.save(`auth-logs-${generatedAt.toISOString().slice(0, 10)}.pdf`);
  };

  const showingText = (
    <div className="text-sm text-gray-700">
      Showing <b>{decoratedRows?.length || 0}</b> of <b>{data?.count ?? 0}</b>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-emerald-950">Auth Logs</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track login/logout activity (success & failed). Logout rows show session duration.
          </p>

          <div className="mt-2 text-xs text-gray-600">
            <b>Sessions:</b> {stats.totalSessions}{" "}
            <span className="mx-2">•</span>
            <b>Total:</b> {formatDuration(stats.totalMs)}{" "}
            <span className="mx-2">•</span>
            <b>Avg:</b> {formatDuration(stats.avgMs)}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchLogs}
            className="rounded-xl px-4 py-2 font-semibold bg-emerald-700 text-white hover:bg-emerald-800"
          >
            Refresh
          </button>

          <button
            onClick={downloadPdf}
            disabled={loading || (decoratedRows?.length || 0) === 0}
            className={cx(
              "rounded-xl px-4 py-2 font-semibold border",
              loading || (decoratedRows?.length || 0) === 0
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50"
            )}
            title={!token ? "Login as admin first" : "Download PDF"}
          >
            Download PDF
          </button>
        </div>
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

      {/* Tabs + Content */}
      <div className="rounded-2xl border border-[#ece7e1] bg-white overflow-hidden">
        <div className="p-4 sm:p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* LEFT: Showing + Tabs */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            {showingText}

            <div className="flex gap-2">
              <TabButton
                active={activeTab === "logs"}
                onClick={() => setActiveTab("logs")}
                rightMeta={
                  <span
                    className={cx(
                      "text-[11px] px-2 py-0.5 rounded-full border font-extrabold",
                      activeTab === "logs"
                        ? "bg-white/15 text-white border-white/20"
                        : "bg-gray-50 text-gray-800 border-gray-200"
                    )}
                  >
                    {decoratedRows?.length || 0}
                  </span>
                }
              >
                Auth Logs
              </TabButton>

              <TabButton
                active={activeTab === "sessions"}
                onClick={() => setActiveTab("sessions")}
                rightMeta={
                  <span
                    className={cx(
                      "text-[11px] px-2 py-0.5 rounded-full border font-extrabold",
                      activeTab === "sessions"
                        ? "bg-white/15 text-white border-white/20"
                        : "bg-gray-50 text-gray-800 border-gray-200"
                    )}
                  >
                    {sessions?.length || 0}
                  </span>
                }
              >
                Sessions Summary
              </TabButton>
            </div>
          </div>

          {/* RIGHT: Error */}
          {err ? <div className="text-sm font-semibold text-red-700">{err}</div> : null}
        </div>

        {/* Tab content */}
        {activeTab === "logs" ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#f9faf7] text-left text-gray-700">
                <tr>
                  <th className="px-4 py-3 font-extrabold">Time</th>
                  <th className="px-4 py-3 font-extrabold">User</th>
                  <th className="px-4 py-3 font-extrabold">Action</th>
                  <th className="px-4 py-3 font-extrabold">Status</th>
                  <th className="px-4 py-3 font-extrabold">Session Time</th>
                  <th className="px-4 py-3 font-extrabold">Message</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td className="px-4 py-4 text-gray-600" colSpan={6}>
                      Loading...
                    </td>
                  </tr>
                ) : (decoratedRows || []).length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-gray-600" colSpan={6}>
                      No logs found.
                    </td>
                  </tr>
                ) : (
                  decoratedRows.map((row) => (
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

                      <td className="px-4 py-3 whitespace-nowrap text-gray-700 font-semibold">
                        {row.session_text || "—"}
                      </td>

                      <td className="px-4 py-3 text-gray-700">{row.message || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#f9faf7] text-left text-gray-700">
                <tr>
                  <th className="px-4 py-3 font-extrabold">User</th>
                  <th className="px-4 py-3 font-extrabold">Login</th>
                  <th className="px-4 py-3 font-extrabold">Logout</th>
                  <th className="px-4 py-3 font-extrabold">Duration</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td className="px-4 py-4 text-gray-600" colSpan={4}>
                      Loading...
                    </td>
                  </tr>
                ) : sessions.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-gray-600" colSpan={4}>
                      No complete sessions found (need both LOGIN SUCCESS and LOGOUT SUCCESS).
                    </td>
                  </tr>
                ) : (
                  sessions.map((s, idx) => (
                    <tr key={`${s.key}-${idx}`} className="hover:bg-gray-50/60">
                      <td className="px-4 py-3">
                        <div className="font-bold text-emerald-950">{s.username}</div>
                        <div className="text-xs text-gray-500">{s.email || "—"}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                        {fmtLocal(s.loginAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                        {fmtLocal(s.logoutAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700 font-semibold">
                        {formatDuration(s.durationMs)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
