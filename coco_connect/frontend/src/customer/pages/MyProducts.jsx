import { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";

function getInitials(value = "") {
  if (!value) return "U";
  return String(value)
    .split("@")[0]
    .split(/[\s._-]+/)
    .map((v) => v?.[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ✅ safely convert string/object/id to display text
function asText(v) {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (typeof v === "object") return v.name || v.title || v.slug || v.email || v.username || "";
  return String(v);
}

function getAuthorId(author) {
  if (!author) return null;
  if (typeof author === "number") return author;
  if (typeof author === "string") {
    // could be numeric id or email
    const n = Number(author);
    return Number.isFinite(n) ? n : null;
  }
  if (typeof author === "object") {
    const n = Number(author.id);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function getAuthorEmail(author) {
  if (!author) return "";
  if (typeof author === "string") return author.includes("@") ? author : "";
  if (typeof author === "object") return (author.email || "").trim();
  return "";
}

export default function MyProducts() {
  const token = useMemo(() => localStorage.getItem("access"), []);

  // ✅ don't freeze user at mount time; allow refresh updates
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  const myEmail = (user?.email || "").trim();
  const myUserId = Number(user?.id) || null;

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  // ✅ (optional but best) refresh user data on page load so dashboard never shows undefined
  useEffect(() => {
    const syncUser = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;

        const me = await res.json();
        // me returns {id, username, email, name}
        const fixedUser = {
          ...user,
          id: me.id,
          email: me.email,
          name: me.name,
          username: me.username,
        };
        localStorage.setItem("user", JSON.stringify(fixedUser));
        setUser(fixedUser);
      } catch {
        // ignore
      }
    };
    syncUser();
    // eslint-disable-next-line
  }, [token]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(`${API_BASE}/products/`);
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(String(e.message || e));
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  // ✅ filter my products robustly
  const myProducts = useMemo(() => {
    if (!myEmail && !myUserId) return [];

    const emailLower = myEmail.toLowerCase();

    return items.filter((p) => {
      const a = p?.author;

      // match by id if possible
      const aId = getAuthorId(a);
      if (myUserId && aId && aId === myUserId) return true;

      // match by email if possible
      const aEmail = getAuthorEmail(a).toLowerCase();
      if (emailLower && aEmail && aEmail === emailLower) return true;

      return false;
    });
  }, [items, myEmail, myUserId]);

  // ✅ analytics (handle category/type objects)
  const analytics = useMemo(() => {
    const total = myProducts.length;

    const prices = myProducts.map((p) => Number(p?.price) || 0);
    const totalValue = prices.reduce((a, b) => a + b, 0);
    const avgPrice = total ? totalValue / total : 0;

    const byCategory = {};
    const byType = {};

    myProducts.forEach((p) => {
      const c = asText(p?.category) || "unknown";
      // your backend likely sends product_type, not type
      const t = asText(p?.product_type || p?.type) || "unknown";

      byCategory[c] = (byCategory[c] || 0) + 1;
      byType[t] = (byType[t] || 0) + 1;
    });

    const topCategory =
      Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    const topType =
      Object.entries(byType).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    return { total, totalValue, avgPrice, topCategory, topType };
  }, [myProducts]);

  if (!myEmail && !myUserId) {
    return (
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
        <h2 className="text-xl font-extrabold text-emerald-950">My Products</h2>
        <p className="mt-2 text-slate-600">Please login to see your products.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-emerald-950">My Products</h1>
            <p className="mt-1 text-slate-600">
              Showing products created by{" "}
              <span className="font-semibold">{myEmail || `User #${myUserId}`}</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-lime-300 text-emerald-950 grid place-items-center font-extrabold">
            {getInitials(myEmail || String(myUserId))}
          </div>
        </div>

        {err && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
            {err}
          </div>
        )}
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card title="Total Products" value={analytics.total} />
        <Card title="Total Value" value={`LKR ${Math.round(analytics.totalValue).toLocaleString()}`} />
        <Card title="Avg Price" value={`LKR ${Math.round(analytics.avgPrice).toLocaleString()}`} />
        <Card title="Top Category" value={analytics.topCategory} />
        <Card title="Top Type" value={analytics.topType} />
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-sm text-slate-600">
                <th className="px-5 py-3 font-bold">Product</th>
                <th className="px-5 py-3 font-bold">Category</th>
                <th className="px-5 py-3 font-bold">Type</th>
                <th className="px-5 py-3 font-bold">Price</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-slate-600">
                    Loading...
                  </td>
                </tr>
              ) : myProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-slate-500">
                    You haven’t created any products yet.
                  </td>
                </tr>
              ) : (
                myProducts.map((p) => {
                  const categoryLabel = asText(p?.category) || "-";
                  const typeLabel = asText(p?.product_type || p?.type) || "-";

                  return (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-10 h-10 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-100 grid place-items-center font-bold text-slate-700">
                              {getInitials(p.name)}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900">{asText(p.name)}</div>
                            <div className="text-xs text-slate-500 line-clamp-1">
                              {asText(p.description)}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-700">{categoryLabel}</td>
                      <td className="px-5 py-4 text-slate-700">{typeLabel}</td>
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        LKR {Number(p.price || 0).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
      <div className="text-xs font-bold text-slate-500">{title}</div>
      <div className="mt-2 text-lg font-extrabold text-emerald-950">{value}</div>
    </div>
  );
}
