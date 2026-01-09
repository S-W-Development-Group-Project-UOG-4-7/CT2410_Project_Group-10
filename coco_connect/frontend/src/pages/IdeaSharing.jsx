import { useEffect, useState } from "react";
import BackgroundRain from "../components/BackgroundRain";
import PayHerePayment from "../components/PayHerePayment";

const API = "http://127.0.0.1:8000/api";

function getInitials(name = "U") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function IdeaSharing() {
  const token = localStorage.getItem("access");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const myEmail = user?.email;

  const [ideas, setIdeas] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [payIdea, setPayIdea] = useState(null);
  const [purchased, setPurchased] = useState([]);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [title, setTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [fullDesc, setFullDesc] = useState("");
  const [file, setFile] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState("");

  // ✅ publishing state
  const [isPublishing, setIsPublishing] = useState(false);

  // ✅ similarity error state (409)
  const [similarError, setSimilarError] = useState(null);

  // LOAD IDEAS
  useEffect(() => {
    fetch(`${API}/ideas/`)
      .then((res) => res.json())
      .then((data) => setIdeas(Array.isArray(data) ? data : []));
  }, []);

  // FILTER + SEARCH
  const filteredIdeas = ideas.filter((idea) => {
    const ownerOk = filter === "mine" ? idea.author_name === myEmail : true;

    const searchOk =
      (idea.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (idea.short_description || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    return ownerOk && searchOk;
  });

  const resetForm = () => {
    setTitle("");
    setShortDesc("");
    setFullDesc("");
    setFile(null);
    setIsPaid(false);
    setPrice("");
    setEditing(null);
  };

  // ✅ CREATE / UPDATE (Updated with AI similarity error handling)
  const handlePublish = async () => {
    if (!token) return alert("Please login");

    if (!title.trim()) return alert("Title is required");
    if (!shortDesc.trim()) return alert("Short description is required");
    if (!fullDesc.trim()) return alert("Full description is required");

    if (isPaid && (!price || Number(price) <= 0)) {
      return alert("Enter valid price");
    }

    setIsPublishing(true);
    setSimilarError(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("short_description", shortDesc);
    formData.append("full_description", fullDesc);
    formData.append("is_paid", isPaid);
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

      // ✅ AI Similarity error (409)
      if (res.status === 409) {
        const err = await res.json();
        setSimilarError(err);
        setIsPublishing(false);
        return;
      }

      if (!res.ok) {
        alert("Failed to publish idea");
        setIsPublishing(false);
        return;
      }

      const data = await res.json();

      setIdeas(
        editing
          ? ideas.map((i) => (i.id === data.id ? data : i))
          : [data, ...ideas]
      );

      // ✅ update selected view if currently opened
      if (selected && editing && selected.id === data.id) {
        setSelected(data);
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

  // DELETE
  const handleDelete = async (id) => {
    const res = await fetch(`${API}/ideas/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return alert("Only owner can delete");

    setIdeas(ideas.filter((i) => i.id !== id));
    setSelected(null);
  };

  const startEdit = () => {
    setEditing(selected);
    setTitle(selected.title);
    setShortDesc(selected.short_description);
    setFullDesc(selected.full_description);
    setIsPaid(selected.is_paid);
    setPrice(selected.price || "");
    setShowForm(true);
  };

  const unlockIdea = (id) => {
    setPurchased([...purchased, id]);
    setPayIdea(null);
  };

  // Check if user can view full details
  const canViewFullDetails = (idea) => {
    return (
      !idea.is_paid ||
      idea.author_name === myEmail ||
      purchased.includes(idea.id)
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7faf8] to-[#eef4ef]">
      <BackgroundRain />

      {/* ✅ PROFESSIONAL SIMILAR IDEAS MODAL - CLEAN & MINIMAL */}
      {similarError && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-[9999]">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg
                    className="w-5 h-5 text-red-600"
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
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900">
                    Similar Idea Detected
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {similarError.error ||
                      "An idea with similar content already exists in the system."}
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Matching Ideas
                </h3>

                <div className="space-y-2">
                  {similarError?.matches?.map((m, index) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-xs font-bold text-gray-400">
                          #{index + 1}
                        </span>
                        <span className="font-medium text-gray-900 truncate">
                          {m.title}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-gray-600 bg-gray-200 px-2.5 py-1 rounded-md ml-2">
                        {m.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-5">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Tip:</span> Please modify your
                  idea to make it more unique, or review the similar ideas
                  before proceeding.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const bestMatch = similarError?.matches?.[0];
                    if (bestMatch) {
                      const ideaToOpen = ideas.find(
                        (i) => i.id === bestMatch.id
                      );
                      if (ideaToOpen) setSelected(ideaToOpen);
                    }
                    setSimilarError(null);
                  }}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  View Similar
                </button>
                <button
                  onClick={() => setSimilarError(null)}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition"
                >
                  Edit My Idea
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
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
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              placeholder="Search ideas by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all shadow-sm"
            />
          </div>
        </div>
      </header>

      {/* GRID */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredIdeas.map((idea) => (
            <div
              key={idea.id}
              onClick={() => setSelected(idea)}
              className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-2xl cursor-pointer transition-all duration-300 border border-gray-100 hover:border-green-200 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-md">
                    {getInitials(idea.author_name)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {idea.author_name}
                    </p>
                    <p className="text-xs text-gray-400">Innovator</p>
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

              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs text-green-600 font-semibold group-hover:underline">
                  View Details →
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredIdeas.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              No ideas found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </main>

      {/* ADD BUTTON */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-green-600 text-white rounded-2xl text-3xl shadow-2xl hover:shadow-green-300 hover:scale-110 transition-all duration-300 font-light flex items-center justify-center hover:bg-green-700"
      >
        +
      </button>

      {/* VIEW MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 relative shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center text-gray-600"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <div className="w-14 h-14 bg-green-600 text-white rounded-2xl flex items-center justify-center font-bold shadow-lg">
                {getInitials(selected.author_name)}
              </div>
              <div>
                <p className="font-bold text-gray-800">
                  {selected.author_name}
                </p>
                <p className="text-sm text-gray-500">Idea Creator</p>
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
                <div className="prose prose-gray max-w-none mb-6">
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
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Download Document
                  </a>
                )}
              </>
            ) : (
              <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
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
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">
                      Premium Content Locked
                    </h3>
                    <p className="text-sm text-gray-600">
                      Purchase this idea to unlock the full description and all
                      resources
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!token) {
                      alert("Please login to purchase this idea");
                      return;
                    }
                    setPayIdea(selected);
                  }}
                  className="w-full bg-yellow-500 text-white px-6 py-4 rounded-xl font-bold hover:bg-yellow-600 transition-all shadow-lg hover:shadow-xl"
                >
                  Purchase Now - LKR {selected.price}
                </button>
              </div>
            )}

            {selected.author_name === myEmail && (
              <div className="border-t border-gray-100 mt-8 pt-6 flex gap-3">
                <button
                  onClick={startEdit}
                  className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg"
                >
                  Edit Idea
                </button>
                <button
                  onClick={() => handleDelete(selected.id)}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors shadow-md hover:shadow-lg"
                >
                  Delete Idea
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <button
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center text-gray-600"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {editing ? "Edit Your Idea" : "Share New Idea"}
              </h2>
              <p className="text-gray-500">
                Fill in the details to publish your idea
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Idea Title
                </label>
                <input
                  className="w-full border border-gray-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                  placeholder="Enter a catchy title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Short Description
                </label>
                <input
                  className="w-full border border-gray-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                  placeholder="Brief summary of your idea..."
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Description
                </label>
                <textarea
                  className="w-full border border-gray-200 p-4 rounded-xl h-40 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all resize-none"
                  placeholder="Provide detailed information about your idea..."
                  value={fullDesc}
                  onChange={(e) => setFullDesc(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Pricing Model
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPaid(false)}
                    className={`py-4 rounded-xl font-semibold transition-all ${
                      !isPaid
                        ? "bg-green-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Free Idea
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPaid(true)}
                    className={`py-4 rounded-xl font-semibold transition-all ${
                      isPaid
                        ? "bg-yellow-500 text-white shadow-lg"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Paid Idea
                  </button>
                </div>
              </div>

              {isPaid && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price (LKR)
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    placeholder="Enter price in LKR..."
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Attach Document (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-green-300 transition-colors">
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                </div>
              </div>

              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl ${
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

      {/* PAYMENT */}
      {payIdea && (
        <PayHerePayment
          idea={payIdea}
          onClose={() => setPayIdea(null)}
          onSuccess={() => unlockIdea(payIdea.id)}
        />
      )}
    </div>
  );
}
