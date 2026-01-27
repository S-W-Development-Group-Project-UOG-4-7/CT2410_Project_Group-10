import { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";

function getInitials(value = "") {
  if (!value) return "U";
  return value
    .split("@")[0]
    .split(/[._-]/)
    .map((v) => v?.[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function MyProducts() {
  const user = useMemo(() => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  }, []);

  const myEmail = user?.email || "";

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

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

  // ✅ only products created by this logged-in user
  const myProducts = useMemo(() => {
    if (!myEmail) return [];
    return items.filter((p) => String(p?.author || "").toLowerCase() === myEmail.toLowerCase());
  }, [items, myEmail]);

  // ✅ analytics
  const analytics = useMemo(() => {
    const total = myProducts.length;

    const prices = myProducts.map((p) => Number(p?.price) || 0);
    const totalValue = prices.reduce((a, b) => a + b, 0);
    const avgPrice = total ? totalValue / total : 0;

    const byCategory = {};
    const byType = {};
    myProducts.forEach((p) => {
      const c = p?.category || "unknown";
      const t = p?.type || "unknown";
      byCategory[c] = (byCategory[c] || 0) + 1;
      byType[t] = (byType[t] || 0) + 1;
    });

    const topCategory =
      Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    const topType =
      Object.entries(byType).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    return { total, totalValue, avgPrice, topCategory, topType };
  }, [myProducts]);

  if (!myEmail) {
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
              Showing products created by <span className="font-semibold">{myEmail}</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-lime-300 text-emerald-950 grid place-items-center font-extrabold">
            {getInitials(myEmail)}
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
        <Card
          title="Total Value"
          value={`LKR ${Math.round(analytics.totalValue).toLocaleString()}`}
        />
        <Card
          title="Avg Price"
          value={`LKR ${Math.round(analytics.avgPrice).toLocaleString()}`}
        />
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
                myProducts.map((p) => (
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
                          <div className="font-bold text-slate-900">{p.name}</div>
                          <div className="text-xs text-slate-500 line-clamp-1">
                            {p.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{p.category || "-"}</td>
                    <td className="px-5 py-4 text-slate-700">{p.type || "-"}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      LKR {Number(p.price || 0).toLocaleString()}
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

function Card({ title, value }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
      <div className="text-xs font-bold text-slate-500">{title}</div>
      <div className="mt-2 text-lg font-extrabold text-emerald-950">{value}</div>
    </div>
  );
}
