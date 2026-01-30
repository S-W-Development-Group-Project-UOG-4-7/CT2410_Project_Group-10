import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import BackgroundRain from "../components/BackgroundRain";
import PayHerePayment from "../components/PayHerePayment";
import SimilarityAlerts from "../components/SimilarityAlerts";

const API = "http://127.0.0.1:8000/api";

/* =========================
   HELPERS
========================= */
function getInitials(name = "U") {
  if (!name || typeof name !== "string") return "U";
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function toPercent(score) {
  if (score === null || score === undefined) return "";
  return `${Math.round(Number(score) * 100)}%`;
}

function safeStr(v, fallback = "") {
  return typeof v === "string" ? v : fallback;
}

export default function IdeaSharing() {
  const navigate = useNavigate();

  const token = localStorage.getItem("access");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const myEmail = safeStr(user?.email, "").toLowerCase();

  // ideas
  const [ideas, setIdeas] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  // create/edit
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingPublish, setPendingPublish] = useState(null);

  // payment
  const [payIdea, setPayIdea] = useState(null);
  const [purchased, setPurchased] = useState([]);

  // filters
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // form fields
  const [title, setTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [fullDesc, setFullDesc] = useState("");
  const [file, setFile] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState("");

  const [isPublishing, setIsPublishing] = useState(false);

  // similarity states
  const [similarWarning, setSimilarWarning] = useState(null);

  // BLOCK modal states
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockData, setBlockData] = useState(null);

  // ✅ STEP 1: FULL IDEA VIEW state
  const [viewIdea, setViewIdea] = useState(null);
  const [viewIdeaLoading, setViewIdeaLoading] = useState(false);

  // ✅ STEP 4: Add state for delete modal
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // alerts
  const [alertsCount, setAlertsCount] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);

  /* =========================
     LOAD IDEAS
  ========================= */
  const reloadIdeas = async () => {
    try {
      const res = await fetch(`${API}/ideas/`);
      const data = await res.json();
      const arr = Array.isArray(data) ? data : [];
      setIdeas(arr);
      return arr;
    } catch {
      setIdeas([]);
      return [];
    }
  };

  useEffect(() => {
    reloadIdeas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================
   LOAD ALERTS COUNT
========================= */
  useEffect(() => {
    if (!token) return;

    fetch(`${API}/alerts/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      })
      .then((list) => {
        setAlerts(list);
        setAlertsCount(list.length);
      })
      .catch(() => {
        setAlerts([]);
        setAlertsCount(0);
      });
  }, [token]);

  /* =========================
     DERIVED: selected idea
  ========================= */
  const selected = useMemo(() => {
    if (!selectedId) return null;
    return ideas.find((i) => i.id === selectedId) || null;
  }, [selectedId, ideas]);

  /* =========================
     HELPER: check if idea has warning
  ========================= */
  const hasWarning = (ideaId) => {
    return alerts.some((a) => a.idea === ideaId);
  };

  /* =========================
     FILTERED IDEAS
  ========================= */
  const filteredIdeas = useMemo(() => {
    const s = search.toLowerCase();

    return ideas.filter((idea) => {
      const ideaEmail = safeStr(idea.author_email, "").toLowerCase();
      const ideaName = safeStr(idea.author_name, "");
      const isMine =
        myEmail &&
        (ideaEmail === myEmail ||
          (ideaEmail === "" && ideaName && ideaName === user?.email));

      const ownerOk = filter === "mine" ? isMine : true;

      const searchOk =
        safeStr(idea.title, "").toLowerCase().includes(s) ||
        safeStr(idea.short_description, "").toLowerCase().includes(s);

      return ownerOk && searchOk;
    });
  }, [ideas, filter, search, myEmail, user?.email]);

  /* =========================
     FORM HELPERS
  ========================= */
  const resetForm = () => {
    setTitle("");
    setShortDesc("");
    setFullDesc("");
    setFile(null);
    setIsPaid(false);
    setPrice("");
    setEditing(null);
  };

  const openAddIdea = () => {
    resetForm();
    setShowForm(true);
  };

  const startEdit = () => {
    if (!selected) return;
    setEditing(selected);
    setTitle(safeStr(selected.title, ""));
    setShortDesc(safeStr(selected.short_description, ""));
    setFullDesc(safeStr(selected.full_description, ""));
    setIsPaid(!!selected.is_paid);
    setPrice(selected.price ? String(selected.price) : "");
    setShowForm(true);
  };

  /* =========================
     PAYMENTS
  ========================= */
  const unlockIdea = (id) => {
    setPurchased((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setPayIdea(null);
  };

  const canViewFullDetails = (idea) => {
    const ideaEmail = safeStr(idea.author_email, "").toLowerCase();
    return (
      !idea.is_paid ||
      (myEmail && ideaEmail === myEmail) ||
      purchased.includes(idea.id)
    );
  };

  /* =========================
     ✅ STEP 2: ONE shared function to open similar idea
  ========================= */
  const openSimilarIdeaById = async (ideaId) => {
    if (!ideaId) {
      alert("No similar idea found");
      return;
    }

    try {
      setViewIdea(null);
      setViewIdeaLoading(true);

      const res = await fetch(`${API}/ideas/${ideaId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to load similar idea");

      const data = await res.json();
      setViewIdea(data);

      // ✅ close both modals if they are open
      setShowBlockModal(false); // block modal
      setSimilarWarning(null); // warning modal
    } catch (err) {
      console.error(err);
      alert("Could not open similar idea");
    } finally {
      setViewIdeaLoading(false);
    }
  };

  /* =========================
     PUBLISH / UPDATE
  ========================= */
  const handlePublish = async (force = false) => {
    if (!token) return alert("Please login");

    if (!title.trim()) return alert("Title is required");
    if (!shortDesc.trim()) return alert("Short description is required");
    if (!fullDesc.trim()) return alert("Full description is required");

    if (isPaid && (!price || Number(price) <= 0)) {
      return alert("Enter a valid price");
    }

    setIsPublishing(true);
    setSimilarWarning(null);
    setShowBlockModal(false);
    setBlockData(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("short_description", shortDesc);
    formData.append("full_description", fullDesc);
    formData.append("is_paid", String(isPaid));
    if (isPaid) formData.append("price", price);
    if (file) formData.append("document", file);

    if (force) formData.append("force_publish", "1");

    const url = editing ? `${API}/ideas/${editing.id}/` : `${API}/ideas/`;
    const method = editing ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json().catch(() => null);

      // 🔴 BLOCK (>= 85%)
      if (res.status === 409 && data?.type === "BLOCK") {
        setBlockData(data);
        setShowBlockModal(true);
        return;
      }

      // 🟡 WARNING (65–85%)
      if (data?.type === "WARNING") {
        setPendingPublish({
          title,
          short_description: shortDesc,
          full_description: fullDesc,
          is_paid: isPaid,
          price,
          file,
        });
        setSimilarWarning(data);
        return;
      }

      // 🚨 SERVER ERROR
      if (!res.ok) {
        alert(data?.error || "Failed to publish idea");
        return;
      }

      // ✅ SUCCESS - Updated with toast notification
      setIdeas((prev) =>
        editing
          ? prev.map((i) => (i.id === data.id ? data : i))
          : [data, ...prev]
      );

      toast.success(
        editing ? "✅ Idea updated successfully" : "🎉 Idea added successfully"
      );

      if (editing && selectedId === data.id) {
        setSelectedId(data.id);
      }

      setShowForm(false);
      resetForm();
    } catch (err) {
      console.error("Publish error:", err);
      alert("Network error. Please check your connection.");
    } finally {
      setIsPublishing(false);
    }
  };

  /* =========================
     DELETE
  ========================= */
  const handleDelete = async (id) => {
    const res = await fetch(`${API}/ideas/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return alert("Only owner can delete");

    setIdeas((prev) => prev.filter((i) => i.id !== id));
    setSelectedId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7faf8] to-[#eef4ef]">
      <BackgroundRain />

      {showAlerts && <SimilarityAlerts onClose={() => setShowAlerts(false)} />}

      {/* ================================
         🔔 FLOATING ACTION BUTTONS
      ================================ */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
        {/* ➕ ADD IDEA BUTTON */}
        <button
          onClick={openAddIdea}
          title="Add New Idea"
          className="w-16 h-16 bg-green-600 text-white rounded-full shadow-2xl flex items-center justify-center text-4xl hover:bg-green-700 hover:scale-110 transition-all duration-200 font-light"
        >
          +
        </button>

        {/* 🚨 ALERTS BUTTON */}
        {token && alertsCount > 0 && (
          <button
            onClick={() => setShowAlerts(true)}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full shadow-xl hover:bg-red-700 transition-all duration-200 hover:scale-105"
          >
            <span className="font-semibold text-sm">Alerts</span>
            <span className="bg-white text-red-600 font-bold px-2 py-0.5 rounded-full text-xs">
              {alertsCount}
            </span>
          </button>
        )}
      </div>

      {/* =========================
         HEADER
      ========================= */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-green-100 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                Idea Exchange
              </h1>
            </div>

            <div className="flex gap-3">
              {["all", "mine"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-300 ${
                    filter === f
                      ? "bg-green-600 text-white shadow-lg shadow-green-200"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  {f === "all" ? "All Ideas" : "My Ideas"}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 relative">
            <input
              placeholder="Search ideas by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl pl-4 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all shadow-sm"
            />
          </div>
        </div>
      </header>

      {/* =========================
     IDEAS GRID – MAIN CONTENT
  ========================= */}
      <main className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-12 md:py-16">
        {filteredIdeas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 auto-rows-fr">
            {filteredIdeas.map((idea) => {
              const ownerLabel =
                safeStr(idea.author_name, "") ||
                safeStr(idea.author_email, "") ||
                "Anonymous";

              const isMyIdea =
                safeStr(idea.author_email, "").toLowerCase() ===
                myEmail.toLowerCase();
              const hasAlert = hasWarning(idea.id);

              return (
                <article
                  key={idea.id}
                  onClick={() => setSelectedId(idea.id)}
                  className={`
              group bg-white rounded-2xl overflow-hidden
              border border-gray-200 shadow-md hover:shadow-xl hover:shadow-green-100/30
              hover:border-green-300 transition-all duration-300 ease-out
              cursor-pointer flex flex-col h-full
              focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
            `}
                >
                  <div className="flex flex-col flex-1 p-6">
                    {/* Header: Avatar + Owner + Badges */}
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div className="flex items-center gap-3.5">
                        <div className="relative flex-shrink-0">
                          <div
                            className="
                      w-12 h-12 bg-gradient-to-br from-green-500 to-green-600
                      text-white rounded-xl flex items-center justify-center
                      font-bold text-base shadow-md
                    "
                          >
                            {getInitials(ownerLabel)}
                          </div>

                          {isMyIdea && (
                            <div
                              className="
                        absolute -top-1 -right-1 w-5 h-5
                        bg-blue-500 rounded-full border-2 border-white
                        flex items-center justify-center shadow-sm
                      "
                            >
                              <svg
                                className="w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-base truncate">
                            {ownerLabel}
                          </p>
                          {idea.author_email && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[180px]">
                              {idea.author_email}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-col items-end gap-2.5">
                        <span
                          className={`
                      px-4 py-1.5 text-xs font-bold rounded-full shadow-sm whitespace-nowrap
                      ${
                        idea.is_paid
                          ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white"
                          : "bg-gradient-to-r from-green-400 to-green-500 text-white"
                      }
                    `}
                        >
                          {idea.is_paid
                            ? `₦${Number(idea.price).toLocaleString()}`
                            : "FREE"}
                        </span>

                        {isMyIdea && hasAlert && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowAlerts(true);
                            }}
                            title="Similarity Alert – Click to review"
                            className="
                        inline-flex items-center gap-1.5 px-3.5 py-1.5
                        bg-gradient-to-r from-red-400 to-red-500 text-white
                        hover:from-red-500 hover:to-red-600
                        rounded-full text-xs font-bold shadow-sm
                        transition-all duration-200
                      "
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Alert
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h3
                      className="
                text-xl font-bold text-gray-900 mb-3 leading-tight
                group-hover:text-green-700 transition-colors duration-200
                line-clamp-2 min-h-[3.5rem]
              "
                    >
                      {idea.title}
                    </h3>

                    {/* Description */}
                    <p
                      className="
                text-sm text-gray-600 leading-relaxed line-clamp-3
                flex-1 mb-6
              "
                    >
                      {idea.short_description}
                    </p>

                    {/* Footer */}
                    <div
                      className="
                flex items-center justify-between mt-auto pt-4
                border-t border-gray-100 text-xs text-gray-500
              "
                    >
                      <div className="flex items-center gap-1.5">
                        <svg
                          className="w-4 h-4 opacity-70"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <time
                          dateTime={idea.created_at || new Date().toISOString()}
                        >
                          {new Date(
                            idea.created_at || Date.now()
                          ).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </time>
                      </div>

                      <span
                        className="
                  px-3 py-1 bg-gray-100 text-gray-600 rounded-full
                  text-xs font-medium
                "
                      >
                        {idea.is_paid ? "Premium" : "Community"}
                      </span>
                    </div>
                  </div>

                  {/* Subtle bottom hover line */}
                  <div
                    className="
              h-1 bg-gradient-to-r from-green-400 via-green-500 to-green-400
              opacity-0 group-hover:opacity-70 transition-opacity duration-300
            "
                  />
                </article>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div
            className="
      text-center py-20 px-6 bg-white rounded-2xl border border-gray-200 shadow-sm
    "
          >
            <div
              className="
        w-20 h-20 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center
      "
            >
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No ideas found
            </h3>

            <p className="text-gray-600 max-w-md mx-auto mb-8 text-base">
              {search
                ? `No results for "${search}". Try different keywords or clear search.`
                : filter === "mine"
                ? "You haven't shared any ideas yet. Start creating!"
                : "This category is empty. Be the first to share your idea."}
            </p>

            {!search && filter !== "mine" && (
              <button
                onClick={openAddIdea}
                className="
            inline-flex items-center gap-2 px-6 py-3
            bg-gradient-to-r from-green-500 to-green-600 text-white font-medium
            rounded-xl shadow-md hover:shadow-lg hover:from-green-600 hover:to-green-700
            transition-all duration-200
          "
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Share Your Idea
              </button>
            )}
          </div>
        )}
      </main>

      {/* =========================
         VIEW MODAL
      ========================= */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 relative shadow-2xl">
            <button
              onClick={() => setSelectedId(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center text-gray-600"
            >
              ✕
            </button>

            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <div className="w-14 h-14 bg-green-600 text-white rounded-2xl flex items-center justify-center font-bold shadow-lg">
                {getInitials(selected.author_name || selected.author_email)}
              </div>
              <div>
                <p className="font-bold text-gray-800">
                  {selected.author_name || selected.author_email || "Unknown"}
                </p>
                {selected.author_email && (
                  <p className="text-sm text-gray-500">
                    {selected.author_email}
                  </p>
                )}
              </div>

              <span
                className={`ml-auto px-4 py-2 text-sm font-bold rounded-full ${
                  selected.is_paid
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {selected.is_paid ? `LKR ${selected.price}` : "FREE"}
              </span>
            </div>

            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              {selected.title}
            </h2>

            <div className="mb-6 pb-6 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                Overview
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {selected.short_description}
              </p>
            </div>

            {canViewFullDetails(selected) ? (
              <>
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                    Full Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selected.full_description}
                  </p>
                </div>

                {selected.document && (
                  <a
                    href={`http://127.0.0.1:8000${selected.document}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors font-semibold"
                  >
                    Download Document
                  </a>
                )}
              </>
            ) : (
              <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200">
                <p className="text-sm text-gray-700 mb-4">
                  Purchase this idea to unlock full content.
                </p>
                <button
                  onClick={() => {
                    if (!token) return alert("Please login to purchase");
                    setPayIdea(selected);
                  }}
                  className="w-full bg-yellow-500 text-white px-6 py-4 rounded-xl font-bold hover:bg-yellow-600 transition-all"
                >
                  Purchase Now - LKR {selected.price}
                </button>
              </div>
            )}

            {/* OWNER ACTIONS */}
            {safeStr(selected.author_email, "").toLowerCase() === myEmail && (
              <div className="border-t border-gray-100 mt-8 pt-6 flex gap-3">
                <button
                  onClick={startEdit}
                  className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600"
                >
                  Edit Idea
                </button>
                {/* ✅ STEP 5: Updated delete button to open confirmation modal */}
                <button
                  onClick={() => setConfirmDeleteId(selected.id)}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600"
                >
                  Delete Idea
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================
         CREATE / EDIT MODAL - UPDATED WITH DARK TEXT
      ========================= */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative shadow-2xl">
            {/* Close */}
            <button
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
            >
              ✕
            </button>

            {/* Header */}
            <h2 className="text-3xl font-bold text-gray-900 mb-1">
              {editing ? "Edit Idea" : "Share New Idea"}
            </h2>
            <p className="text-gray-500 mb-8">Fill in the details to publish</p>

            {/* Form */}
            <div className="space-y-6">
              {/* Title - UPDATED with text-gray-900 placeholder-gray-400 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Idea Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your idea title"
                  className="w-full border border-gray-200 rounded-xl px-4 py-4 
                           text-gray-900 placeholder-gray-400
                           focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              {/* Short Description - UPDATED with text-gray-900 placeholder-gray-400 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Short Description
                </label>
                <input
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  placeholder="Brief overview of your idea"
                  className="w-full border border-gray-200 rounded-xl px-4 py-4 
                           text-gray-900 placeholder-gray-400
                           focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              {/* Full Description - UPDATED with text-gray-900 placeholder-gray-400 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Description
                </label>
                <textarea
                  value={fullDesc}
                  onChange={(e) => setFullDesc(e.target.value)}
                  placeholder="Explain your idea in detail"
                  className="w-full border border-gray-200 rounded-xl px-4 py-4 h-40 resize-none 
                           text-gray-900 placeholder-gray-400
                           focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              {/* Pricing */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Pricing Model
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setIsPaid(false)}
                    className={`py-4 rounded-xl font-semibold border transition ${
                      !isPaid
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                  >
                    Free Idea
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPaid(true)}
                    className={`py-4 rounded-xl font-semibold border transition ${
                      isPaid
                        ? "bg-yellow-500 text-white border-yellow-500"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                  >
                    Paid Idea
                  </button>
                </div>
              </div>

              {/* Price - UPDATED with text-gray-900 placeholder-gray-400 */}
              {isPaid && (
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Price (LKR)"
                  className="w-full border border-gray-200 rounded-xl px-4 py-4 
                           text-gray-900 placeholder-gray-400
                           focus:ring-2 focus:ring-yellow-400 outline-none"
                />
              )}

              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Attach Document (optional)
                </label>

                <div className="relative border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-green-500 transition">
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />

                  {!file ? (
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <span className="text-3xl">📎</span>
                      <p className="font-semibold">Click to upload file</p>
                      <p className="text-xs">PDF, DOC, PPT, etc.</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2 text-green-700">
                        <span className="text-lg">📄</span>
                        <span className="text-sm font-semibold truncate max-w-[200px]">
                          {file.name}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-red-500 hover:text-red-600 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={() => handlePublish(false)}
                disabled={isPublishing}
                className={`w-full py-4 rounded-xl font-bold text-lg transition ${
                  isPublishing
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isPublishing
                  ? "Publishing..."
                  : editing
                  ? "Update Idea"
                  : "Publish Idea"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
         PAYHERE MODAL
      ========================= */}
      {payIdea && (
        <PayHerePayment
          idea={payIdea}
          onClose={() => setPayIdea(null)}
          onSuccess={() => unlockIdea(payIdea.id)}
        />
      )}

      {/* =========================
   SIMILARITY WARNING MODAL (65-85%)
========================= */}
      {similarWarning && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[9999] backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden">
            {/* Header - Light & Clean */}
            <div className="bg-white px-6 py-5 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-2.5 rounded-lg">
                  <svg
                    className="w-6 h-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Similar Ideas Detected
                  </h2>
                  <p className="text-sm text-gray-600 mt-0.5">
                    We found {similarWarning.matches.length} similar idea
                    {similarWarning.matches.length > 1 ? "s" : ""} in the
                    database
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 bg-gray-50">
              <p className="text-gray-600 text-sm mb-4">
                Please review the similar ideas below. You can edit your idea to
                make it more unique or proceed with publishing.
              </p>

              {/* Similar Ideas List */}
              <div className="space-y-3 mb-6 max-h-72 overflow-y-auto pr-2">
                {similarWarning.matches.map((m, index) => (
                  <div
                    key={m.id || index}
                    className="group bg-white hover:bg-gray-50 rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="flex items-center justify-center w-6 h-6 bg-yellow-500 text-white text-xs font-bold rounded-full">
                            {index + 1}
                          </span>
                          <h3 className="font-semibold text-gray-900 truncate">
                            {m.title}
                          </h3>
                        </div>
                        {m.author && (
                          <p className="text-xs text-gray-500 ml-8">
                            By: <span className="font-medium">{m.author}</span>
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5 bg-yellow-100 px-3 py-1.5 rounded-full">
                          <svg
                            className="w-4 h-4 text-yellow-700"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm font-bold text-yellow-800">
                            {toPercent(m.score)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">match</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                {/* Edit Idea - Blue */}
                <button
                  onClick={() => {
                    setSimilarWarning(null);
                    setShowForm(true);
                  }}
                  className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Idea
                </button>

                {/* ✅ STEP 3: Updated "View Similar Idea" button */}
                <button
                  onClick={() =>
                    openSimilarIdeaById(similarWarning?.matches?.[0]?.id)
                  }
                  className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-gray-900 rounded-lg hover:bg-black transition-colors shadow-sm hover:shadow"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  View Similar Idea
                </button>

                {/* Cancel - Red */}
                <button
                  onClick={() => {
                    setSimilarWarning(null);
                    setPendingPublish(null);
                  }}
                  className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm hover:shadow"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Cancel
                </button>

                {/* Publish Anyway - Green */}
                <button
                  onClick={() => handlePublish(true)}
                  className={`flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white rounded-lg shadow-sm hover:shadow transition-colors ${
                    isPublishing
                      ? "bg-green-300 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {isPublishing ? "Publishing..." : "Publish Anyway"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================
         BLOCK MODAL (≥85% Similarity) - UPDATED
      ========================= */}
      {showBlockModal && blockData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[9999] backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden">
            {/* Header - Red */}
            <div className="bg-red-50 px-6 py-5 border-b border-red-100">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2.5 rounded-lg">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-red-700">
                    Too Similar to Publish
                  </h2>
                  <p className="text-sm text-red-600 mt-0.5">
                    Your idea is {Math.round(blockData.similarity * 100)}%
                    similar to existing ideas
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700 mb-6">
                Please review the similar ideas below. You need to make your
                idea more unique before publishing.
              </p>

              {/* Similar Ideas List */}
              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
                {blockData.matches.map((match, index) => (
                  <div
                    key={match.id || index}
                    className="group bg-white hover:bg-red-50 rounded-lg border border-red-200 p-4 transition-all duration-200 hover:shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full">
                            {index + 1}
                          </span>
                          <h3 className="font-semibold text-gray-900 truncate">
                            {match.title}
                          </h3>
                        </div>

                        {match.author && (
                          <p className="text-xs text-gray-500 ml-8 mb-2">
                            By:{" "}
                            <span className="font-medium">{match.author}</span>
                          </p>
                        )}

                        {match.short_description && (
                          <p className="text-sm text-gray-600 ml-8 line-clamp-2">
                            {match.short_description}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5 bg-red-100 px-3 py-1.5 rounded-full">
                          <span className="text-sm font-bold text-red-800">
                            {Math.round((match.score || 0) * 100)}%
                          </span>
                          <span className="text-xs text-red-600">similar</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                {/* Edit Idea - Blue */}
                <button
                  onClick={() => {
                    setShowBlockModal(false);
                    setBlockData(null);
                    setShowForm(true);
                  }}
                  className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Idea
                </button>

                {/* ✅ STEP 3: Updated to use the shared function */}
                <button
                  onClick={() =>
                    openSimilarIdeaById(blockData?.matches?.[0]?.id)
                  }
                  className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-gray-800 rounded-lg hover:bg-black transition-colors shadow-sm hover:shadow"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  View Similar Idea
                </button>

                {/* Cancel & Close - Red */}
                <button
                  onClick={() => {
                    setShowBlockModal(false);
                    setBlockData(null);
                    setShowForm(false);
                    resetForm();
                  }}
                  className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm hover:shadow col-span-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Cancel & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================
         ✅ STEP 4: FULL IDEA VIEW MODAL
      ========================= */}
      {(viewIdea || viewIdeaLoading) && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* HEADER */}
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Similar Idea</h2>
              <button
                onClick={() => setViewIdea(null)}
                className="text-slate-500 hover:text-black"
              >
                ✕
              </button>
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto p-6">
              {viewIdeaLoading ? (
                <div className="text-slate-700 font-semibold">Loading...</div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {viewIdea.title}
                  </h3>

                  <p className="text-sm text-slate-600 mb-4">
                    By {viewIdea.author_email}
                  </p>

                  <div className="text-slate-700 whitespace-pre-line leading-relaxed">
                    {viewIdea.full_description}
                  </div>
                </>
              )}
            </div>

            {/* FOOTER */}
            <div className="border-t p-4 flex gap-3">
              <button
                onClick={() => {
                  setViewIdea(null);
                  setShowForm(true);
                }}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
              >
                Edit My Idea
              </button>
              <button
                onClick={() => setViewIdea(null)}
                className="flex-1 bg-slate-200 text-slate-800 py-2 rounded-lg font-semibold hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
         ✅ STEP 6: DELETE CONFIRMATION MODAL
      ========================= */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Confirm Deletion
            </h3>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this idea? This action cannot be
              undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-3 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  await handleDelete(confirmDeleteId);
                  setConfirmDeleteId(null);
                  toast.success("🗑️ Idea deleted successfully");
                }}
                className="flex-1 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
