import { useEffect, useMemo, useState } from "react";
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

  // similarity responses
  const [similarBlock, setSimilarBlock] = useState(null);
  const [similarWarning, setSimilarWarning] = useState(null);

  // alerts
  const [alertsCount, setAlertsCount] = useState(0);
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
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setAlertsCount(Array.isArray(data) ? data.length : 0))
      .catch(() => setAlertsCount(0));
  }, [token]);

  /* =========================
     DERIVED: selected idea
  ========================= */
  const selected = useMemo(() => {
    if (!selectedId) return null;
    return ideas.find((i) => i.id === selectedId) || null;
  }, [selectedId, ideas]);

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
          (ideaEmail === "" && ideaName && ideaName === user?.email)); // extra fallback

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
     OPEN BEST MATCH
  ========================= */
  const openBestMatch = async (matches) => {
    if (!matches || matches.length === 0) return;

    const best = matches[0];
    let found = ideas.find((i) => i.id === best.id);

    if (!found) {
      const refreshed = await reloadIdeas();
      found = refreshed.find((i) => i.id === best.id);
    }

    if (found) setSelectedId(found.id);
  };

  /* =========================
     PUBLISH / UPDATE
  ========================= */
  const handlePublish = async () => {
    if (!token) return alert("Please login");

    if (!title.trim()) return alert("Title is required");
    if (!shortDesc.trim()) return alert("Short description is required");
    if (!fullDesc.trim()) return alert("Full description is required");

    if (isPaid && (!price || Number(price) <= 0)) {
      return alert("Enter a valid price");
    }

    setIsPublishing(true);
    setSimilarBlock(null);
    setSimilarWarning(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("short_description", shortDesc);
    formData.append("full_description", fullDesc);
    formData.append("is_paid", String(isPaid));
    if (isPaid) formData.append("price", price);
    if (file) formData.append("document", file);

    const url = editing ? `${API}/ideas/${editing.id}/` : `${API}/ideas/`;
    const method = editing ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const responseJson = await res.json().catch(() => null);

      // BLOCK
      if (res.status === 409 && responseJson?.type === "BLOCK") {
        setSimilarBlock(responseJson);
        return;
      }

      // ERROR
      if (!res.ok) {
        alert(responseJson?.error || "Failed to publish idea");
        return;
      }

      // WARNING (do NOT publish yet)
      if (responseJson?.type === "WARNING") {
        setPendingPublish({
          title,
          short_description: shortDesc,
          full_description: fullDesc,
          is_paid: isPaid,
          price,
          file,
        });

        setSimilarWarning(responseJson);
        return;
      }

      // NORMAL SUCCESS
      const data = responseJson;

      setIdeas((prev) =>
        editing
          ? prev.map((i) => (i.id === data.id ? data : i))
          : [data, ...prev]
      );

      if (editing && selectedId === data.id) {
        setSelectedId(data.id);
      }

      setShowForm(false);
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
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
         GRID
      ========================= */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredIdeas.map((idea) => {
            const ownerLabel =
              safeStr(idea.author_name, "") ||
              safeStr(idea.author_email, "") ||
              "Unknown";

            return (
              <div
                key={idea.id}
                onClick={() => setSelectedId(idea.id)}
                className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-2xl cursor-pointer transition-all duration-300 border border-gray-100 hover:border-green-200 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-md">
                      {getInitials(ownerLabel)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {ownerLabel}
                      </p>
                      {idea.author_email && (
                        <p className="text-xs text-gray-400">
                          {idea.author_email}
                        </p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1.5 text-xs font-bold rounded-full ${
                      idea.is_paid
                        ? "bg-yellow-100 text-yellow-700 shadow-sm"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {idea.is_paid ? `LKR ${idea.price}` : "FREE"}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-green-600 transition-colors line-clamp-2">
                  {idea.title}
                </h3>

                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                  {idea.short_description}
                </p>
              </div>
            );
          })}
        </div>

        {filteredIdeas.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              No ideas found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filters
            </p>
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
                <button
                  onClick={() => handleDelete(selected.id)}
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
         CREATE / EDIT MODAL
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
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Idea Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your idea title"
                  className="w-full border border-gray-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Short Description
                </label>
                <input
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  placeholder="Brief overview of your idea"
                  className="w-full border border-gray-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              {/* Full Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Description
                </label>
                <textarea
                  value={fullDesc}
                  onChange={(e) => setFullDesc(e.target.value)}
                  placeholder="Explain your idea in detail"
                  className="w-full border border-gray-200 rounded-xl px-4 py-4 h-40 resize-none focus:ring-2 focus:ring-green-500 outline-none"
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

              {/* Price */}
              {isPaid && (
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Price (LKR)"
                  className="w-full border border-gray-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-yellow-400 outline-none"
                />
              )}

              {/* PERFECT FILE UPLOAD */}
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
                onClick={handlePublish}
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
   SIMILARITY WARNING MODAL
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

                {/* View Similar - Black */}
                <button
                  onClick={() => openBestMatch(similarWarning.matches)}
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
                  View Similar
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
                  onClick={async () => {
                    if (!pendingPublish) return;

                    const fd = new FormData();
                    fd.append("title", pendingPublish.title);
                    fd.append(
                      "short_description",
                      pendingPublish.short_description
                    );
                    fd.append(
                      "full_description",
                      pendingPublish.full_description
                    );
                    fd.append("is_paid", String(pendingPublish.is_paid));
                    if (pendingPublish.is_paid)
                      fd.append("price", pendingPublish.price);
                    if (pendingPublish.file)
                      fd.append("document", pendingPublish.file);

                    fd.append("force_publish", "1");

                    const res = await fetch(`${API}/ideas/`, {
                      method: "POST",
                      headers: { Authorization: `Bearer ${token}` },
                      body: fd,
                    });

                    const data = await res.json();

                    if (!res.ok) {
                      alert(data?.error || "Failed to publish idea");
                      return;
                    }

                    setIdeas((prev) => [data, ...prev]);

                    setPendingPublish(null);
                    setSimilarWarning(null);
                    setShowForm(false);
                    resetForm();
                  }}
                  className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm hover:shadow"
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
                  Publish Anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
