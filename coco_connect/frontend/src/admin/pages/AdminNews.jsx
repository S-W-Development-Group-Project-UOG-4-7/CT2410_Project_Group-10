import { useEffect, useMemo, useState } from "react";

const API_BASE = "http://127.0.0.1:8000/api/news/";

export default function AdminNews() {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  // Add form
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    date: "", // YYYY-MM-DD
    status: "Draft",
  });

  // View modal
  const [viewItem, setViewItem] = useState(null);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    date: "",
    status: "Draft",
  });

  const sortedNews = useMemo(() => {
    return [...newsList].sort((a, b) => {
      const da = a?.date ? new Date(a.date).getTime() : 0;
      const db = b?.date ? new Date(b.date).getTime() : 0;
      if (db !== da) return db - da;
      return (b?.id ?? 0) - (a?.id ?? 0);
    });
  }, [newsList]);

  const fetchNews = async () => {
    setLoading(true);
    setErrMsg("");
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`GET failed (${res.status}) ${text}`);
      }
      const data = await res.json();
      setNewsList(Array.isArray(data) ? data : []);
    } catch (e) {
      setErrMsg(e?.message || "Failed to load news");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this news?")) return;

    try {
      const res = await fetch(`${API_BASE}${id}/`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const text = await res.text();
        throw new Error(`DELETE failed (${res.status}) ${text}`);
      }
      setNewsList((prev) => prev.filter((n) => n.id !== id));
      if (viewItem?.id === id) setViewItem(null);
      if (editId === id) {
        setEditOpen(false);
        setEditId(null);
      }
    } catch (e) {
      alert(e?.message || "Delete failed");
    }
  };

  // Add (POST)
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setErrMsg("");

    if (!form.title.trim()) return setErrMsg("Title is required");
    if (!form.date) return setErrMsg("Date is required (YYYY-MM-DD)");

    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          content: form.content?.trim() || "",
          date: form.date,
          status: form.status,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`POST failed (${res.status}) ${text}`);
      }

      const created = await res.json();
      setNewsList((prev) => [created, ...prev]);
      setForm({ title: "", content: "", date: "", status: "Draft" });
      setShowAdd(false);
    } catch (e2) {
      setErrMsg(e2?.message || "Add failed");
    }
  };

  // View (GET single)
  const handleView = async (id) => {
    setErrMsg("");
    try {
      const res = await fetch(`${API_BASE}${id}/`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`VIEW failed (${res.status}) ${text}`);
      }
      const item = await res.json();
      setViewItem(item);
    } catch (e) {
      setErrMsg(e?.message || "View failed");
    }
  };

  // Open edit modal and load data
  const handleOpenEdit = async (id) => {
    setErrMsg("");
    setEditOpen(true);
    setEditId(id);

    try {
      const res = await fetch(`${API_BASE}${id}/`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`EDIT load failed (${res.status}) ${text}`);
      }
      const item = await res.json();
      setEditForm({
        title: item?.title || "",
        content: item?.content || "",
        date: item?.date || "",
        status: item?.status || "Draft",
      });
    } catch (e) {
      setErrMsg(e?.message || "Failed to load item for edit");
    }
  };

  // Save edit (PUT)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setErrMsg("");

    if (!editId) return;
    if (!editForm.title.trim()) return setErrMsg("Title is required");
    if (!editForm.date) return setErrMsg("Date is required (YYYY-MM-DD)");

    try {
      const res = await fetch(`${API_BASE}${editId}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          title: editForm.title.trim(),
          content: editForm.content?.trim() || "",
          date: editForm.date,
          status: editForm.status,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`UPDATE failed (${res.status}) ${text}`);
      }

      const updated = await res.json();

      setNewsList((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      if (viewItem?.id === updated.id) setViewItem(updated);

      setEditOpen(false);
      setEditId(null);
    } catch (e2) {
      setErrMsg(e2?.message || "Update failed");
    }
  };

  const formatDate = (d) => {
    if (!d) return "-";
    return new Date(d + "T00:00:00").toLocaleDateString();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">News Management</h1>

        <div className="flex gap-2">
          <button
            onClick={fetchNews}
            className="px-4 py-2 bg-[#2196f3] text-white rounded-lg hover:bg-[#64b5f6]"
          >
            Refresh
          </button>

          <button
            onClick={() => setShowAdd((v) => !v)}
            className="px-4 py-2 bg-[#4caf50] text-white rounded-lg hover:bg-[#66bb6a]"
          >
            {showAdd ? "Close" : "+ Add News"}
          </button>
        </div>
      </div>

      {errMsg ? (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
          {errMsg}
        </div>
      ) : null}

      {showAdd ? (
        <form
          onSubmit={handleAddSubmit}
          className="mb-6 p-4 bg-white border border-[#ece7e1] rounded-xl shadow-sm"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Title</label>
              <input
                className="w-full border rounded-lg p-2"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="News title"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Date</label>
              <input
                type="date"
                className="w-full border rounded-lg p-2"
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm mb-1">Content</label>
              <textarea
                className="w-full border rounded-lg p-2"
                rows={3}
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                placeholder="Optional content"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Status</label>
              <select
                className="w-full border rounded-lg p-2"
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="px-4 py-2 bg-[#4caf50] text-white rounded-lg hover:bg-[#66bb6a]"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      ) : null}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-[#ece7e1] rounded-xl shadow-sm">
          <thead>
            <tr className="bg-[#f2f7f2] text-left">
              <th className="py-3 px-4 border-b">ID</th>
              <th className="py-3 px-4 border-b">Title</th>
              <th className="py-3 px-4 border-b">Date</th>
              <th className="py-3 px-4 border-b">Status</th>
              <th className="py-3 px-4 border-b">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="py-4 px-4" colSpan={5}>
                  Loading...
                </td>
              </tr>
            ) : sortedNews.length === 0 ? (
              <tr>
                <td className="py-4 px-4" colSpan={5}>
                  No news found.
                </td>
              </tr>
            ) : (
              sortedNews.map((news) => (
                <tr key={news.id} className="hover:bg-[#f9faf7]">
                  <td className="py-3 px-4 border-b">{news.id}</td>
                  <td className="py-3 px-4 border-b">{news.title}</td>
                  <td className="py-3 px-4 border-b">{formatDate(news.date)}</td>
                  <td className="py-3 px-4 border-b">{news.status}</td>
                  <td className="py-3 px-4 border-b">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEdit(news.id)}
                        className="px-3 py-1 bg-[#4caf50] text-white rounded-lg hover:bg-[#66bb6a]"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(news.id)}
                        className="px-3 py-1 bg-[#f44336] text-white rounded-lg hover:bg-[#e57373]"
                      >
                        Delete
                      </button>

                      <button
                        onClick={() => handleView(news.id)}
                        className="px-3 py-1 bg-[#2196f3] text-white rounded-lg hover:bg-[#64b5f6]"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {viewItem ? (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-xl shadow-lg border border-[#ece7e1] p-5">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h2 className="text-xl font-bold">{viewItem.title}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {formatDate(viewItem.date)} • {viewItem.status}
                </p>
              </div>

              <button
                onClick={() => setViewItem(null)}
                className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>

            <div className="mt-4">
              <p className="font-semibold mb-1">Content</p>
              <div className="border rounded-lg p-3 bg-gray-50 whitespace-pre-wrap">
                {viewItem.content || "-"}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {editOpen ? (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-xl shadow-lg border border-[#ece7e1] p-5">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Edit News</h2>
              <button
                onClick={() => {
                  setEditOpen(false);
                  setEditId(null);
                }}
                className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Title</label>
                  <input
                    className="w-full border rounded-lg p-2"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, title: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Date</label>
                  <input
                    type="date"
                    className="w-full border rounded-lg p-2"
                    value={editForm.date}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, date: e.target.value }))
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm mb-1">Content</label>
                  <textarea
                    className="w-full border rounded-lg p-2"
                    rows={4}
                    value={editForm.content}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, content: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Status</label>
                  <select
                    className="w-full border rounded-lg p-2"
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, status: e.target.value }))
                    }
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#4caf50] text-white rounded-lg hover:bg-[#66bb6a]"
                  >
                    Update
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}