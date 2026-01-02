import { useEffect, useState } from "react";
import BackgroundRain from "../components/BackgroundRain";

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

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [title, setTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [fullDesc, setFullDesc] = useState("");
  const [file, setFile] = useState(null);

  // LOAD IDEAS
  useEffect(() => {
    fetch(`${API}/ideas/`)
      .then((res) => res.json())
      .then((data) => setIdeas(Array.isArray(data) ? data : []));
  }, []);

  // FILTER + SEARCH
  const filteredIdeas = ideas.filter((idea) => {
    const matchesOwner =
      filter === "mine" ? idea.author_name === myEmail : true;

    const matchesSearch =
      idea.title.toLowerCase().includes(search.toLowerCase()) ||
      idea.short_description.toLowerCase().includes(search.toLowerCase());

    return matchesOwner && matchesSearch;
  });

  const resetForm = () => {
    setTitle("");
    setShortDesc("");
    setFullDesc("");
    setFile(null);
    setEditing(null);
  };

  // CREATE / UPDATE IDEA
  const handlePublish = async () => {
    if (!token) return alert("Please login");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("short_description", shortDesc);
    formData.append("full_description", fullDesc);
    if (file) formData.append("document", file);

    const url = editing ? `${API}/ideas/${editing.id}/` : `${API}/ideas/`;

    const method = editing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) return alert("Failed to save idea");

    const data = await res.json();

    setIdeas(
      editing
        ? ideas.map((i) => (i.id === data.id ? data : i))
        : [data, ...ideas]
    );

    setShowForm(false);
    resetForm();
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

  // START EDIT
  const startEdit = (idea) => {
    setEditing(idea);
    setTitle(idea.title);
    setShortDesc(idea.short_description);
    setFullDesc(idea.full_description);
    setShowForm(true);
    setSelected(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7faf8] to-[#edf4ef]">
      <BackgroundRain />

      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-extrabold text-green-700">
            Idea Sharing Platform
          </h1>

          <div className="flex gap-2">
            {["all", "mine"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                  filter === f
                    ? "bg-green-600 text-white shadow"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f === "all" ? "All Ideas" : "My Ideas"}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-4">
          <input
            type="text"
            placeholder="Search ideas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-300"
          />
        </div>
      </header>

      {/* GRID */}
      <main className="max-w-7xl mx-auto px-6 py-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredIdeas.map((idea) => (
          <div
            key={idea.id}
            onClick={() => setSelected(idea)}
            className="bg-white rounded-3xl p-6 shadow-md hover:shadow-xl transition cursor-pointer"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-11 h-11 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                {getInitials(idea.author_name)}
              </div>
              <div>
                <p className="font-semibold">{idea.author_name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(idea.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <h3 className="text-xl font-bold mb-2">{idea.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-3">
              {idea.short_description}
            </p>
          </div>
        ))}
      </main>

      {/* ADD BUTTON */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-green-600 text-white text-4xl shadow-2xl hover:bg-green-700 transition"
      >
        +
      </button>

      {/* CREATE / EDIT MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 relative">
            <button
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="absolute top-4 right-4 text-xl"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-6">
              {editing ? "Edit Idea" : "Create New Idea"}
            </h2>

            <input
              className="w-full border rounded-xl p-3 mb-3"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              className="w-full border rounded-xl p-3 mb-3"
              placeholder="Short description"
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
            />

            <textarea
              className="w-full border rounded-xl p-3 mb-4 h-32"
              placeholder="Full description"
              value={fullDesc}
              onChange={(e) => setFullDesc(e.target.value)}
            />

            {/* 🔥 PROFESSIONAL FILE UPLOAD */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Attach document (optional)
              </p>

              <label
                htmlFor="fileUpload"
                className="flex flex-col items-center justify-center gap-3
                           border-2 border-dashed border-green-300
                           rounded-2xl p-6 cursor-pointer
                           hover:border-green-500 hover:bg-green-50
                           transition text-center"
              >
                <div
                  className="w-12 h-12 rounded-full bg-green-100
                                flex items-center justify-center text-green-600 text-2xl"
                >
                  📎
                </div>

                <div>
                  <p className="font-semibold text-gray-700">
                    {file ? file.name : "Click to upload or drag & drop"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX</p>
                </div>

                <input
                  id="fileUpload"
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </label>

              {file && (
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="mt-2 text-sm text-red-500 hover:underline"
                >
                  Remove file
                </button>
              )}
            </div>

            <button
              onClick={handlePublish}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700"
            >
              {editing ? "Update Idea" : "Publish Idea"}
            </button>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-8 relative">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-xl"
            >
              ✕
            </button>

            <h2 className="text-3xl font-bold mb-4">{selected.title}</h2>

            <p className="text-gray-700 whitespace-pre-wrap mb-6">
              {selected.full_description}
            </p>

            {selected.document && (
              <a
                href={`http://127.0.0.1:8000${selected.document}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 font-semibold mb-6"
              >
                📎 Download attached document
              </a>
            )}

            {selected.author_name === myEmail && (
              <div className="border-t pt-6 mt-6">
                <p className="text-sm text-gray-500 mb-3">Owner actions</p>
                <div className="flex gap-4">
                  <button
                    onClick={() => startEdit(selected)}
                    className="px-6 py-3 bg-blue-500 text-white rounded-xl"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(selected.id)}
                    className="px-6 py-3 bg-red-500 text-white rounded-xl"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
