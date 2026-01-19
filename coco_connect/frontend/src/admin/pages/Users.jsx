import { useEffect, useMemo, useRef, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Chart from "chart.js/auto";

const API_BASE = "http://localhost:8000/api";

/* -----------------------------
   Auth helpers (unchanged keys)
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

/* -----------------------------
   Small utils
------------------------------ */
function fmtDateTime(d = new Date()) {
  try {
    return new Intl.DateTimeFormat("en-LK", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return d.toLocaleString();
  }
}

function safeRole(u) {
  const r = (u?.role || "").toString().trim();
  if (!r) return u?.is_staff ? "Admin" : "User";
  const lower = r.toLowerCase();
  if (lower === "admin") return "Admin";
  if (lower === "user") return "User";
  return r;
}

function statusLabel(u) {
  return u?.is_active ? "Active" : "Inactive";
}

function kpiChip(label, value, tone = "neutral") {
  const toneCls =
    tone === "good"
      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
      : tone === "bad"
      ? "bg-red-50 border-red-200 text-red-900"
      : "bg-white border-[#ece7e1] text-[#6b3f23]/90";
  return (
    <span
      className={[
        "px-3 py-1 rounded-full border text-sm whitespace-nowrap",
        toneCls,
      ].join(" ")}
    >
      {label}: <b className="font-extrabold">{value}</b>
    </span>
  );
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  // export button loading
  const [exporting, setExporting] = useState(false);

  // Add user form
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "User",
  });

  const [showAnalytics, setShowAnalytics] = useState(true);

  // Chart canvases for on-page analytics
  const pieCanvasRef = useRef(null);
  const barCanvasRef = useRef(null);
  const lineCanvasRef = useRef(null);

  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);
  const lineChartRef = useRef(null);

  const fetchUsers = async (query = "") => {
    setLoading(true);
    try {
      const url = `${API_BASE}/users/${
        query ? `?q=${encodeURIComponent(query)}` : ""
      }`;

      const res = await fetch(url, { headers: authHeaders() });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          res.status === 401
            ? "Unauthorized (401). You are not sending a valid JWT token."
            : res.status === 403
            ? "Forbidden (403). You are authenticated but not an admin/staff user."
            : data?.error || "Failed to fetch users";
        throw new Error(msg);
      }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    fetchUsers(q);
  };

  // ✅ Add user
  const onAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/register/`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));
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
      const res = await fetch(`${API_BASE}/users/${id}/`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      const data = await res.json().catch(() => ({}));
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
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ is_active }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to update status");

      fetchUsers(q);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  /* -----------------------------
     Derived analytics
  ------------------------------ */
  const analytics = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.is_active).length;
    const inactive = total - active;

    const roleCounts = users.reduce((acc, u) => {
      const r = safeRole(u);
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    }, {});

    const admins = roleCounts.Admin || 0;

    // registrations by day (only if backend sends date_joined / created_at)
    const byDay = users.reduce((acc, u) => {
      const raw = u?.date_joined || u?.created_at || u?.createdAt || "";
      const dt = raw ? new Date(raw) : null;
      if (!dt || Number.isNaN(dt.getTime())) return acc;
      const key = dt.toISOString().slice(0, 10); // YYYY-MM-DD
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const byDayEntries = Object.entries(byDay).sort((a, b) =>
      a[0].localeCompare(b[0])
    );

    // last 7 days series (nice even if missing days)
    const last7 = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      last7.push({ key, count: byDay[key] || 0 });
    }

    return {
      total,
      active,
      inactive,
      admins,
      roleCounts,
      activePct: total ? Math.round((active / total) * 100) : 0,
      inactivePct: total ? Math.round((inactive / total) * 100) : 0,
      byDayEntries,
      last7,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users;
    return users.filter((u) => {
      const name = String(u?.name || "").toLowerCase();
      const email = String(u?.email || "").toLowerCase();
      return name.includes(s) || email.includes(s);
    });
  }, [users, q]);

  /* -----------------------------
     On-page charts (clean + stable)
  ------------------------------ */
  useEffect(() => {
    if (!showAnalytics) return;

    // PIE: Active vs Inactive
    if (pieCanvasRef.current) {
      if (pieChartRef.current) pieChartRef.current.destroy();

      const ctx = pieCanvasRef.current.getContext("2d");
      pieChartRef.current = new Chart(ctx, {
        type: "pie",
        data: {
          labels: ["Active", "Inactive"],
          datasets: [{ data: [analytics.active, analytics.inactive] }],
        },
        options: {
          plugins: { legend: { position: "bottom" } },
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    }

    // BAR: Role distribution
    if (barCanvasRef.current) {
      if (barChartRef.current) barChartRef.current.destroy();

      const entries = Object.entries(analytics.roleCounts || {}).sort(
        (a, b) => b[1] - a[1]
      );
      const labels = entries.map(([k]) => k);
      const data = entries.map(([, v]) => v);

      const ctx = barCanvasRef.current.getContext("2d");
      barChartRef.current = new Chart(ctx, {
        type: "bar",
        data: { labels, datasets: [{ label: "Users", data }] },
        options: {
          plugins: { legend: { display: false } },
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
        },
      });
    }

    // LINE: registrations last 7 days (only shows meaning if backend sends dates)
    if (lineCanvasRef.current) {
      if (lineChartRef.current) lineChartRef.current.destroy();

      const labels = analytics.last7.map((x) => x.key.slice(5)); // MM-DD
      const data = analytics.last7.map((x) => x.count);

      const ctx = lineCanvasRef.current.getContext("2d");
      lineChartRef.current = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [{ label: "Registrations", data, tension: 0.3 }],
        },
        options: {
          plugins: { legend: { display: false } },
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
        },
      });
    }

    return () => {
      if (pieChartRef.current) pieChartRef.current.destroy();
      if (barChartRef.current) barChartRef.current.destroy();
      if (lineChartRef.current) lineChartRef.current.destroy();
    };
  }, [analytics, showAnalytics]);

  /* -----------------------------
     PDF helpers (more polished)
  ------------------------------ */
  const createChartImage = async (chartConfig, w = 700, h = 380) => {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context not available");

    // clean white background (pdf-friendly)
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, w, h);

    const chart = new Chart(ctx, {
      ...chartConfig,
      options: {
        ...(chartConfig.options || {}),
        animation: false,
        responsive: false,
        maintainAspectRatio: false,
      },
    });

    const img = chart.toBase64Image("image/png", 1.0);
    chart.destroy();

    return img;
  };

  const exportUsersPDF = async () => {
    try {
      if (!users.length) {
        alert("No users to export.");
        return;
      }

      setExporting(true);

      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 36;

      const headerBarH = 56;

      const drawHeader = () => {
        // top bar
        doc.setFillColor(6, 78, 59); // emerald-900-ish
        doc.rect(0, 0, pageW, headerBarH, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.text("CocoConnect — Users Report", margin, 36);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(220, 252, 231); // light green tint
        doc.text(`Generated: ${fmtDateTime(new Date())}`, pageW - margin, 36, {
          align: "right",
        });

        // reset text color
        doc.setTextColor(0, 0, 0);
      };

      const drawFooter = (pageNum, totalPages) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(
          `Page ${pageNum} of ${totalPages}`,
          pageW - margin,
          pageH - 18,
          { align: "right" }
        );
        doc.setTextColor(0, 0, 0);
      };

      drawHeader();

      // KPI cards
      const y0 = headerBarH + 18;
      const cardH = 56;
      const gap = 10;
      const cardW = (pageW - margin * 2 - gap * 2) / 3;

      const card = (x, title, value, sub) => {
        doc.setDrawColor(230, 230, 230);
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(x, y0, cardW, cardH, 10, 10, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(title, x + 14, y0 + 20);

        doc.setFontSize(18);
        doc.text(String(value), x + 14, y0 + 42);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        if (sub) doc.text(sub, x + 14, y0 + 54);
      };

      card(margin, "Active Users", analytics.active, `${analytics.activePct}%`);
      card(
        margin + cardW + gap,
        "Inactive Users",
        analytics.inactive,
        `${analytics.inactivePct}%`
      );
      card(
        margin + (cardW + gap) * 2,
        "Admins",
        analytics.admins,
        `Total: ${analytics.total}`
      );

      // Charts row (3 charts)
      const chartsY = y0 + cardH + 18;

      const pieImg = await createChartImage({
        type: "pie",
        data: {
          labels: ["Active", "Inactive"],
          datasets: [{ data: [analytics.active, analytics.inactive] }],
        },
        options: { plugins: { legend: { position: "bottom" } } },
      });

      const roleEntries = Object.entries(analytics.roleCounts || {}).sort(
        (a, b) => b[1] - a[1]
      );
      const roleLabels = roleEntries.map(([k]) => k);
      const roleData = roleEntries.map(([, v]) => v);

      const barImg = await createChartImage({
        type: "bar",
        data: { labels: roleLabels, datasets: [{ label: "Users", data: roleData }] },
        options: {
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
        },
      });

      const lineImg = await createChartImage({
        type: "line",
        data: {
          labels: analytics.last7.map((x) => x.key.slice(5)),
          datasets: [{ label: "Registrations", data: analytics.last7.map((x) => x.count), tension: 0.3 }],
        },
        options: {
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
        },
      });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Analytics", margin, chartsY);

      const chartBoxY = chartsY + 10;
      const boxGap = 12;
      const boxW = (pageW - margin * 2 - boxGap * 2) / 3;
      const boxH = 170;

      const addChartBox = (x, title, img) => {
        doc.setDrawColor(230, 230, 230);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(x, chartBoxY, boxW, boxH, 10, 10, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(title, x + 10, chartBoxY + 18);
        doc.addImage(img, "PNG", x + 10, chartBoxY + 26, boxW - 20, boxH - 36);
      };

      addChartBox(margin, "Active vs Inactive", pieImg);
      addChartBox(margin + boxW + boxGap, "Role Distribution", barImg);
      addChartBox(margin + (boxW + boxGap) * 2, "Registrations (7 days)", lineImg);

      // Table on next pages if needed
      const startTableY = chartBoxY + boxH + 18;

      const rows = users.map((u) => [
        u.name || "",
        u.email || "",
        statusLabel(u),
        safeRole(u),
      ]);

      autoTable(doc, {
        head: [["Name", "Email", "Status", "Role"]],
        body: rows,
        startY: startTableY,
        styles: { fontSize: 9, cellPadding: 6 },
        headStyles: { fillColor: [6, 78, 59] }, // emerald header
        alternateRowStyles: { fillColor: [249, 250, 247] },
        margin: { left: margin, right: margin, top: margin, bottom: 28 },
        didDrawPage: () => {
          // keep header on every page
          drawHeader();
        },
      });

      // Page numbers (after table generates pages)
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        drawFooter(i, totalPages);
      }

      doc.save("cococonnect-users-report.pdf");
    } catch (err) {
      console.error(err);
      alert(err?.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page card */}
      <div className="bg-white border-2 border-[#ece7e1] rounded-2xl p-8 shadow-md space-y-6">
        {/* Title + actions */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-extrabold text-[#6b3f23]">
              Registered Users
            </h2>
            <p className="text-sm text-[#6b3f23]/70 mt-1">
              Manage users, view analytics, and export a professional PDF report.
            </p>
          </div>

          <form onSubmit={onSearch} className="flex gap-2 items-center flex-wrap">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name/email..."
              className="w-64 rounded-xl border border-[#ece7e1] bg-[#f9faf7] px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
            <button
              className="rounded-xl px-4 py-2 font-semibold bg-emerald-600 text-white hover:opacity-90"
              type="submit"
            >
              Search
            </button>

            <button
              type="button"
              onClick={() => setShowAnalytics((p) => !p)}
              className="rounded-xl px-4 py-2 font-semibold border border-[#ece7e1] bg-white hover:bg-[#f9faf7]"
              title="Toggle analytics"
            >
              {showAnalytics ? "Hide Analytics" : "Show Analytics"}
            </button>

            <button
              type="button"
              onClick={exportUsersPDF}
              disabled={exporting}
              className={[
                "rounded-xl px-4 py-2 font-semibold text-white",
                exporting
                  ? "bg-[#6b3f23]/50 cursor-not-allowed"
                  : "bg-[#6b3f23] hover:opacity-90",
              ].join(" ")}
            >
              {exporting ? "Exporting..." : "Export PDF"}
            </button>
          </form>
        </div>

        {/* KPI chips */}
        <div className="flex gap-2 flex-wrap">
          {kpiChip("Total", analytics.total)}
          {kpiChip("Active", analytics.active, "good")}
          {kpiChip("Inactive", analytics.inactive, analytics.inactive ? "bad" : "good")}
          {kpiChip("Admins", analytics.admins)}
        </div>

        {/* Analytics section */}
        {showAnalytics && (
          <div className="rounded-2xl border border-[#ece7e1] bg-[#f9faf7] p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="font-extrabold text-[#6b3f23]">User Analytics</div>
              <div className="text-xs text-[#6b3f23]/70">
                * Registrations chart needs <code>date_joined</code> (or <code>created_at</code>) from backend.
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-white border border-[#ece7e1] rounded-2xl p-4">
                <div className="text-sm font-semibold text-[#6b3f23] mb-2">
                  Active vs Inactive
                </div>
                <div className="h-56">
                  <canvas ref={pieCanvasRef} />
                </div>
              </div>

              <div className="bg-white border border-[#ece7e1] rounded-2xl p-4">
                <div className="text-sm font-semibold text-[#6b3f23] mb-2">
                  Role Distribution
                </div>
                <div className="h-56">
                  <canvas ref={barCanvasRef} />
                </div>
              </div>

              <div className="bg-white border border-[#ece7e1] rounded-2xl p-4">
                <div className="text-sm font-semibold text-[#6b3f23] mb-2">
                  Registrations (Last 7 Days)
                </div>
                <div className="h-56">
                  <canvas ref={lineCanvasRef} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add user form */}
        <form
          onSubmit={onAddUser}
          className="rounded-2xl border border-[#ece7e1] bg-[#f9faf7] p-5"
        >
          <div className="font-extrabold text-[#6b3f23] mb-3">Add User</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              placeholder="Full name"
              className="rounded-xl border border-[#ece7e1] bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500/30"
              required
            />
            <input
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              placeholder="Email"
              type="email"
              className="rounded-xl border border-[#ece7e1] bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500/30"
              required
            />
            <input
              value={form.password}
              onChange={(e) =>
                setForm((s) => ({ ...s, password: e.target.value }))
              }
              placeholder="Password"
              type="password"
              className="rounded-xl border border-[#ece7e1] bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500/30"
              required
            />
            <select
              value={form.role}
              onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))}
              className="rounded-xl border border-[#ece7e1] bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500/30"
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
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-[#6b3f23]/60">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-[#ece7e1]">
                    <td className="py-3 font-semibold">{u.name}</td>
                    <td>{u.email}</td>
                    <td
                      className={
                        u.is_active
                          ? "text-emerald-600 font-semibold"
                          : "text-red-500 font-semibold"
                      }
                    >
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
                          className="rounded-xl px-3 py-2 text-sm font-semibold bg-emerald-600 text-white hover:opacity-90"
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

        {/* Small note 
        <div className="text-xs text-[#6b3f23]/60">
          Tip: If JWT issues happen, check that <code>localStorage.getItem("access")</code> has a value and
          requests include <code>Authorization: Bearer {"<token>"}</code>.
        </div>*/}
      </div>
    </div>
  );
}
