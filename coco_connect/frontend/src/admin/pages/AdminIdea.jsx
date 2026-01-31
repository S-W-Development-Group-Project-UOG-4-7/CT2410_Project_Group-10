import { useEffect, useMemo, useState } from "react";
import {
  Trash2,
  X,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Flag,
  FileText,
  User,
  Mail,
  Calendar,
  TrendingUp,
} from "lucide-react";

const API = "http://127.0.0.1:8000/api";

export default function AdminIdea() {
  const token = localStorage.getItem("access");

  const [ideas, setIdeas] = useState([]);
  const [reportedRaw, setReportedRaw] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ======================
     LOAD DATA
  ====================== */
  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadIdeas(), loadReported()]);
      setLoading(false);
    })();
  }, []);

  const loadIdeas = async () => {
    try {
      const res = await fetch(`${API}/admin/ideas/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setIdeas(Array.isArray(data) ? data : []);
    } catch {
      showToast("Failed to load ideas", "error");
    }
  };

  const loadReported = async () => {
    try {
      const res = await fetch(`${API}/admin/reported-ideas/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setReportedRaw(Array.isArray(data) ? data : []);
    } catch {
      showToast("Failed to load reported ideas", "error");
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  };

  /* ======================
     DERIVED DATA
  ====================== */
  const reportedIdeas = useMemo(() => {
    const map = new Map();
    for (const r of reportedRaw) {
      if (!map.has(r.idea_id)) {
        map.set(r.idea_id, {
          id: r.idea_id,
          title: r.title,
          short_description: r.short_description,
          full_description: r.full_description,
          author_name: r.author_name || r.author,
          author_email: r.author_email,
          similarity: r.similarity,
          created_at: r.created_at,
        });
      }
    }
    return Array.from(map.values());
  }, [reportedRaw]);

  const list = activeTab === "all" ? ideas : reportedIdeas;

  /* ======================
     DELETE ACTION
  ====================== */
  const confirmRemove = async () => {
    const id = confirmDelete?.id;
    if (!id) return;

    try {
      const res = await fetch(`${API}/admin/ideas/${id}/delete/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();

      setIdeas((prev) => prev.filter((i) => i.id !== id));
      setReportedRaw((prev) => prev.filter((r) => r.idea_id !== id));
      setSelectedIdea(null);
      setConfirmDelete(null);

      showToast("This reported idea is removed", "success");
    } catch {
      showToast("Failed to remove idea", "error");
    }
  };

  /* ======================
     ANALYTICS
  ====================== */
  const totalIdeas = ideas.length;
  const reportedCount = reportedIdeas.length;
  const safePercent = totalIdeas
    ? Math.round((reportedCount / totalIdeas) * 100)
    : 0;

  /* ======================
     DOWNLOAD CSV REPORT
  ====================== */
  const downloadReport = () => {
    const rows = [
      ["ID", "Title", "Author", "Email", "Reported", "Similarity (%)"],
    ];

    ideas.forEach((idea) => {
      const reported = reportedIdeas.find((r) => r.id === idea.id);
      rows.push([
        idea.id,
        idea.title,
        idea.author_name || "Unknown",
        idea.author_email || "",
        reported ? "YES" : "NO",
        reported && reported.similarity
          ? (reported.similarity * 100).toFixed(1)
          : "",
      ]);
    });

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "ideas_report.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  /* ======================
     UI
  ====================== */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Idea Moderation
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage and review submitted ideas
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Ideas
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {ideas.length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 shadow-lg shadow-red-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-100">
                    Reported Ideas
                  </p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {reportedIdeas.length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-white/20">
                  <Flag className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ANALYTICS */}
        <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TOTAL */}
          <div className="rounded-xl bg-white p-6 border shadow-sm">
            <p className="text-sm text-gray-500 font-semibold">Total Ideas</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {totalIdeas}
            </p>
          </div>

          {/* REPORTED */}
          <div className="rounded-xl bg-white p-6 border shadow-sm">
            <p className="text-sm text-gray-500 font-semibold">
              Reported Ideas
            </p>
            <p className="text-3xl font-bold text-red-600 mt-1">
              {reportedCount}
            </p>
          </div>

          {/* VISUAL CHART */}
          <div className="rounded-xl bg-white p-6 border shadow-sm">
            <p className="text-sm font-semibold text-gray-600 mb-2">
              Report Ratio
            </p>

            <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all"
                style={{ width: `${safePercent}%` }}
              />
            </div>

            <p className="text-xs text-gray-500 mt-2">
              {safePercent}% of ideas are reported
            </p>
          </div>
        </div>

        {/* DOWNLOAD */}
        <div className="mb-8 flex justify-end">
          <button
            onClick={downloadReport}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition"
          >
            ⬇ Download Idea Report
          </button>
        </div>

        {/* TABS */}
        <div className="mb-8">
          <div className="bg-white rounded-xl p-1.5 shadow-sm border border-gray-200 inline-flex gap-1">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                activeTab === "all"
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/30"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              All Ideas
            </button>
            <button
              onClick={() => setActiveTab("reported")}
              className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 relative ${
                activeTab === "reported"
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md shadow-red-500/30"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Reported Ideas
              {reportedIdeas.length > 0 && (
                <span
                  className={`ml-2 px-2 py-0.5 text-xs rounded-full font-bold ${
                    activeTab === "reported"
                      ? "bg-white/20 text-white"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {reportedIdeas.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="flex flex-col items-center py-24">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
              <div className="absolute inset-0 h-12 w-12 rounded-full bg-emerald-100 blur-xl animate-pulse"></div>
            </div>
            <p className="mt-6 text-gray-600 font-medium">Loading ideas...</p>
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-16 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-gray-400" />
            </div>
            <p className="mt-4 text-lg font-semibold text-gray-900">
              No ideas found
            </p>
            <p className="mt-2 text-sm text-gray-500">
              {activeTab === "reported"
                ? "No reported ideas at the moment"
                : "Ideas will appear here once submitted"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((idea) => (
              <div
                key={idea.id}
                className="group rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-2 flex-1 group-hover:text-emerald-600 transition-colors">
                      {idea.title}
                    </h3>
                    {activeTab === "reported" && (
                      <div className="ml-2 p-1.5 rounded-lg bg-red-50 flex-shrink-0">
                        <Flag className="h-4 w-4 text-red-600" />
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed mb-4">
                    {idea.short_description || "No description available"}
                  </p>

                  {activeTab === "reported" && idea.similarity != null && (
                    <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-red-700">
                          Similarity Score
                        </span>
                        <span className="text-sm font-bold text-red-600">
                          {(Number(idea.similarity) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 bg-red-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-500"
                          style={{ width: `${Number(idea.similarity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white p-4">
                  <button
                    onClick={() => setSelectedIdea(idea)}
                    className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200"
                  >
                    Review Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* REVIEW MODAL */}
        {selectedIdea && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="border-b border-gray-100 px-8 py-6 bg-gradient-to-r from-gray-50 to-white rounded-t-2xl">
                <button
                  onClick={() => setSelectedIdea(null)}
                  className="absolute right-6 top-6 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                <h2 className="text-2xl font-bold text-gray-900 pr-12">
                  {selectedIdea.title}
                </h2>
              </div>

              {/* Content */}
              <div className="px-8 py-6 max-h-[60vh] overflow-y-auto">
                {/* Author Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="p-2 rounded-lg bg-white">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        Author
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedIdea.author_name || "Unknown"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="p-2 rounded-lg bg-white">
                      <Mail className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Email</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {selectedIdea.author_email || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Similarity Warning */}
                {selectedIdea.similarity != null && (
                  <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-red-100">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-red-900">
                          High Similarity Detected
                        </p>
                        <p className="text-xs text-red-700 mt-0.5">
                          This idea has{" "}
                          {(Number(selectedIdea.similarity) * 100).toFixed(1)}%
                          similarity to existing content
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <h3 className="text-sm font-bold text-gray-900">
                      Full Description
                    </h3>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed shadow-inner">
                    {selectedIdea.full_description ||
                      selectedIdea.short_description ||
                      "No description available"}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 px-8 py-5 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                <button
                  onClick={() => setSelectedIdea(null)}
                  className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() =>
                    setConfirmDelete({
                      id: selectedIdea.id,
                      title: selectedIdea.title,
                    })
                  }
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-500/30 hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:shadow-red-500/40 transition-all"
                >
                  <Trash2 size={16} />
                  Remove Idea
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONFIRM DELETE MODAL */}
        {confirmDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="p-6">
                <div className="mx-auto w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <AlertTriangle className="h-7 w-7 text-red-600" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                  Remove Idea?
                </h3>

                <p className="text-sm text-gray-600 text-center mb-6">
                  Are you sure you want to permanently remove:
                  <br />
                  <span className="font-semibold text-gray-900 mt-1 block">
                    "{confirmDelete.title}"
                  </span>
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmRemove}
                    className="flex-1 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-500/30 hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:shadow-red-500/40 transition-all"
                  >
                    Yes, Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TOAST */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right duration-300">
            <div
              className={`flex items-center gap-3 rounded-xl px-6 py-4 shadow-2xl text-white min-w-[300px] ${
                toast.type === "success"
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-700 shadow-emerald-500/40"
                  : "bg-gradient-to-r from-red-600 to-red-700 shadow-red-500/40"
              }`}
            >
              <div className="p-1.5 rounded-lg bg-white/20">
                {toast.type === "success" ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <AlertTriangle className="h-5 w-5" />
                )}
              </div>
              <span className="text-sm font-semibold flex-1">
                {toast.message}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
