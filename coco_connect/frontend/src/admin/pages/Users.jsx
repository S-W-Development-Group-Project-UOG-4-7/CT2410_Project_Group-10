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
  // normalize a bit (but don't break existing)
  if (r.toLowerCase() === "admin") return "Admin";
  if (r.toLowerCase() === "user") return "User";
  return r;
}

function statusLabel(u) {
  return u?.is_active ? "Active" : "Inactive";
}

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

  // Optional: simple UI analytics view toggle
  const [showAnalytics, setShowAnalytics] = useState(true);

  // Chart canvases for on-page analytics
  const pieCanvasRef = useRef(null);
  const barCanvasRef = useRef(null);
  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);

  const fetchUsers = async (query = "") => {
    setLoading(true);
    try {
      const url = `${API_BASE}/users/${query ? `?q=${encodeURIComponent(query)}` : ""}`;

      const res = await fetch(url, {
        headers: authHeaders(),
      });

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
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    fetchUsers(q);
  };

  // ✅ Add user (kept same endpoint)
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
     Derived analytics (no backend changes)
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

    const admins = roleCounts.Admin || roleCounts.admin || 0;
    const normalUsers = total - admins;

    return {
      total,
      active,
      inactive,
      roleCounts,
      admins,
      normalUsers,
      activePct: total ? Math.round((active / total) * 100) : 0,
      inactivePct: total ? Math.round((inactive / total) * 100) : 0,
    };
  }, [users]);

  /* -----------------------------
     On-page charts (nice dashboard UI)
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

    // BAR: Role distribution (top few)
    if (barCanvasRef.current) {
      if (barChartRef.current) barChartRef.current.destroy();

      const entries = Object.entries(analytics.roleCounts || {}).sort((a, b) => b[1] - a[1]);
      const labels = entries.map(([k]) => k);
      const data = entries.map(([, v]) => v);

      const ctx = barCanvasRef.current.getContext("2d");
      barChartRef.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [{ label: "Users", data }],
        },
        options: {
          plugins: { legend: { display: false } },
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, ticks: { precision: 0 } },
          },
        },
      });
    }

    return () => {
      if (pieChartRef.current) pieChartRef.current.destroy();
      if (barChartRef.current) barChartRef.current.destroy();
    };
  }, [analytics, showAnalytics]);

  /* -----------------------------
     PDF helpers (multi-analytics, nicer PDF)
  ------------------------------ */
  const createChartImage = async (chartConfig, w = 700, h = 380) => {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context not available");

    const chart = new Chart(ctx, {
      ...chartConfig,
      options: {
        ...(chartConfig.options || {}),
        animation: false,
        responsive: false,
        maintainAspectRatio: false,
      },
    });

    const img = chart.toBase64Image();
    chart.destroy();

    return img;
  };

  const exportUsersPDF = async () => {
    try {
      if (!users.length) {
        alert("No users to export.");
        return;
      }

      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 36;

      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("CocoConnect — Users Analytics Report", margin, 48);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Generated: ${fmtDateTime(new Date())}`, margin, 66);
      doc.text(`Total Users: ${analytics.total}`, margin, 82);

      // KPI cards (simple but nice)
      const cardY = 96;
      const cardH = 54;
      const gap = 10;
      const cardW = (pageW - margin * 2 - gap * 2) / 3;

      const drawCard = (x, title, value, sub) => {
        doc.setDrawColor(225, 225, 225);
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(x, cardY, cardW, cardH, 8, 8, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(title, x + 14, cardY + 20);

        doc.setFontSize(18);
        doc.text(String(value), x + 14, cardY + 42);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        if (sub) doc.text(sub, x + 14, cardY + 54);
      };

      drawCard(margin, "Active Users", analytics.active, `${analytics.activePct}% of total`);
      drawCard(margin + cardW + gap, "Inactive Users", analytics.inactive, `${analytics.inactivePct}% of total`);
      drawCard(margin + (cardW + gap) * 2, "Admins", analytics.admins, `Non-admin: ${analytics.normalUsers}`);

      // Charts section
      const chartTop = cardY + cardH + 20;

      // Pie (Active vs Inactive)
      const pieImg = await createChartImage({
        type: "pie",
        data: {
          labels: ["Active", "Inactive"],
          datasets: [{ data: [analytics.active, analytics.inactive] }],
        },
        options: { plugins: { legend: { position: "bottom" } } },
      });

      // Bar (Role distribution)
      const roleEntries = Object.entries(analytics.roleCounts || {}).sort((a, b) => b[1] - a[1]);
      const roleLabels = roleEntries.map(([k]) => k);
      const roleData = roleEntries.map(([, v]) => v);

      const barImg = await createChartImage({
        type: "bar",
        data: {
          labels: roleLabels,
          datasets: [{ label: "Users", data: roleData }],
        },
        options: {
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
        },
      });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Analytics", margin, chartTop);

      const chartY = chartTop + 10;
      const chartW = (pageW - margin * 2 - 14) / 2;
      const chartH = 220;

      doc.addImage(pieImg, "PNG", margin, chartY, chartW, chartH);
      doc.addImage(barImg, "PNG", margin + chartW + 14, chartY, chartW, chartH);

      // Table (users)
      const startTableY = chartY + chartH + 22;

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
        headStyles: { fillColor: [107, 63, 35] }, // matches your theme
        alternateRowStyles: { fillColor: [249, 250, 247] },
        margin: { left: margin, right: margin },
        didDrawPage: (data) => {
          const pageCount = doc.getNumberOfPages();
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.text(
            `Page ${doc.getCurrentPageInfo().pageNumber} of ${pageCount}`,
            pageW - margin,
            doc.internal.pageSize.getHeight() - 18,
            { align: "right" }
          );
        },
      });

      doc.save("cococonnect-users-report.pdf");
    } catch (err) {
      console.error(err);
      alert(err?.message || "Export failed");
    }
  };

  return (
    <div className="bg-white border-2 border-[#ece7e1] rounded-2xl p-8 shadow-md space-y-8">
      {/* Header + actions */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-[#6b3f23]">Registered Users</h2>
          <p className="text-sm text-[#6b3f23]/70 mt-1">
            Manage users, view basic analytics, and export a full PDF report.
          </p>
        </div>

        <form onSubmit={onSearch} className="flex gap-2 items-center flex-wrap">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name/email..."
            className="w-64 rounded-xl border border-[#ece7e1] bg-[#f9faf7] px-4 py-2 outline-none focus:ring-2 focus:ring-[#4caf50]/40"
          />
          <button className="rounded-xl px-4 py-2 font-semibold bg-[#4caf50] text-white hover:opacity-90">
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
            className="rounded-xl px-4 py-2 font-semibold bg-[#6b3f23] text-white hover:opacity-90"
          >
            Export PDF
          </button>
        </form>
      </div>

      {/* Analytics section */}
      {showAnalytics && (
        <div className="rounded-2xl border border-[#ece7e1] bg-[#f9faf7] p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="font-bold text-[#6b3f23]">User Analytics</div>
            <div className="flex gap-2 text-sm text-[#6b3f23]/80">
              <span className="px-3 py-1 rounded-full bg-white border border-[#ece7e1]">
                Total: <b>{analytics.total}</b>
              </span>
              <span className="px-3 py-1 rounded-full bg-white border border-[#ece7e1]">
                Active: <b>{analytics.active}</b>
              </span>
              <span className="px-3 py-1 rounded-full bg-white border border-[#ece7e1]">
                Inactive: <b>{analytics.inactive}</b>
              </span>
              <span className="px-3 py-1 rounded-full bg-white border border-[#ece7e1]">
                Admins: <b>{analytics.admins}</b>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-[#ece7e1] rounded-2xl p-4">
              <div className="text-sm font-semibold text-[#6b3f23] mb-2">
                Active vs Inactive
              </div>
              <div className="h-64">
                <canvas ref={pieCanvasRef} />
              </div>
            </div>

            <div className="bg-white border border-[#ece7e1] rounded-2xl p-4">
              <div className="text-sm font-semibold text-[#6b3f23] mb-2">
                Role Distribution
              </div>
              <div className="h-64">
                <canvas ref={barCanvasRef} />
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
