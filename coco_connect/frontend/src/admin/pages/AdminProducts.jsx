import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function getInitials(value = "") {
  if (!value) return "U";
  return value
    .split("@")[0]
    .split(/[._-]/)
    .map((v) => v[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function AdminProducts() {
  const token = useMemo(() => localStorage.getItem("access"), []);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadProducts = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/products/`, {
        headers: authHeaders(token),
      });

      if (!res.ok) throw new Error("Failed to load products");

      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line
  }, []);

  const filteredItems = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.author?.toLowerCase().includes(q)
    );
  }, [items, search]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      const res = await fetch(`${API_BASE}/products/${id}/`, {
        method: "DELETE",
        headers: authHeaders(token),
      });

      if (!res.ok) throw new Error("Delete failed");

      toast.success("Product deleted");
      setItems((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-emerald-950">
              Products
            </h1>
            <p className="text-slate-600 mt-1">
              Manage products created by users
            </p>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, category, user..."
            className="w-72 rounded-xl border px-4 py-2 focus:ring-2 focus:ring-emerald-300"
          />
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 p-3 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr className="text-sm text-slate-600">
              <th className="px-5 py-3 font-bold">Product</th>
              <th className="px-5 py-3 font-bold">Category</th>
              <th className="px-5 py-3 font-bold">Price</th>
              <th className="px-5 py-3 font-bold">Created By</th>
              <th className="px-5 py-3 font-bold text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                  No products found
                </td>
              </tr>
            ) : (
              filteredItems.map((p) => (
                <tr
                  key={p.id}
                  className="border-b hover:bg-slate-50 transition"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center font-bold text-emerald-800">
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

                  <td className="px-5 py-4">{p.category}</td>

                  <td className="px-5 py-4 font-semibold">
                    LKR {Number(p.price).toLocaleString()}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-800">
                        {getInitials(p.author)}
                      </div>
                      <span className="text-sm font-semibold text-slate-800">
                        {p.author || "—"}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => toast.info("Edit coming soon")}
                      className="px-3 py-1.5 rounded-lg border text-sm hover:bg-slate-100 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="px-3 py-1.5 rounded-lg border border-red-300 text-sm text-red-700 hover:bg-red-50"
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
