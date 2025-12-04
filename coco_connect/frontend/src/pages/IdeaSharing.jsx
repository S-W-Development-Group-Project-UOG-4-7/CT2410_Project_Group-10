import { useState } from "react";

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function IdeaSharing() {
  const loggedInUser = "Niven Asmitha"; // Owner of created ideas

  // ---------------- DEMO IDEAS ------------------
  const [ideas, setIdeas] = useState([
    {
      id: 101,
      title: "Eco-Friendly Coconut Product Finder",
      shortDescription: "Discover sustainable coconut-based products locally.",
      fullDescription:
        "A marketplace app connecting eco-conscious customers with verified coconut product sellers.\n\nFeatures:\n- Seller profiles\n- Ratings\n- Map search\n- Secure checkout",
      isPaid: false,
      price: 0,
      file: null,
      authorName: "Maria Silva",
      createdAt: "2025-11-26",
    },
    {
      id: 102,
      title: "Smart Coconut Farm Monitoring",
      shortDescription: "Monitor coconut trees using IoT sensors.",
      fullDescription:
        "An IoT-based coconut farming system.\n\nIncludes:\n- Soil moisture sensors\n- Water usage tracking\n- Harvest prediction AI",
      isPaid: true,
      price: 20,
      file: null,
      authorName: "James Carter",
      createdAt: "2025-11-22",
    },
    {
      id: 103,
      title: "Coconut Recipe AI Generator",
      shortDescription: "Generate new coconut recipes instantly using AI.",
      fullDescription:
        "AI app for creating custom coconut recipes.\n\nFeatures:\n- Ingredient calculator\n- Step-by-step instructions\n- Diet filters",
      isPaid: false,
      price: 0,
      file: null,
      authorName: "Sakura Ito",
      createdAt: "2025-11-18",
    },
  ]);

  const [selectedIdea, setSelectedIdea] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // -------- FORM STATES --------
  const [title, setTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [fullDesc, setFullDesc] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState(0);
  const [file, setFile] = useState(null);

  // EDIT STATES
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const handlePublish = () => {
    if (!title || !shortDesc || !fullDesc) {
      alert("Please fill all required fields!");
      return;
    }

    const newIdea = {
      id: editId || Date.now(),
      title,
      shortDescription: shortDesc,
      fullDescription: fullDesc,
      isPaid,
      price: isPaid ? price : 0,
      file,
      authorName: loggedInUser,
      createdAt: new Date().toISOString(),
    };

    if (isEditing) {
      setIdeas(ideas.map((idea) => (idea.id === editId ? newIdea : idea)));
      setIsEditing(false);
      setEditId(null);
    } else {
      setIdeas([newIdea, ...ideas]);
    }

    resetForm();
    setShowForm(false);
  };

  const resetForm = () => {
    setTitle("");
    setShortDesc("");
    setFullDesc("");
    setIsPaid(false);
    setPrice(0);
    setFile(null);
  };

  const handleDelete = (id) => {
    setIdeas(ideas.filter((idea) => idea.id !== id));
    setSelectedIdea(null);
  };

  const handleEdit = (idea) => {
    setIsEditing(true);
    setEditId(idea.id);
    setTitle(idea.title);
    setShortDesc(idea.shortDescription);
    setFullDesc(idea.fullDescription);
    setIsPaid(idea.isPaid);
    setPrice(idea.price);
    setFile(idea.file);

    setSelectedIdea(null);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-[#f9faf7] py-6 pb-0">
      <h1 className="text-center text-4xl font-bold text-[#6b3f23] mb-10">
        Idea Sharing Platform
      </h1>

      {/* IDEA GRID */}
      <main className="max-w-7xl mx-auto px-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ideas.map((idea) => (
          <div
            key={idea.id}
            onClick={() => setSelectedIdea(idea)}
            className="cursor-pointer bg-white border-2 border-[#ece7e1] rounded-2xl p-5 shadow hover:shadow-lg hover:border-[#4caf50] transition"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 bg-[#4caf50] text-white rounded-full flex items-center justify-center font-bold">
                {getInitials(idea.authorName)}
              </div>

              <div>
                <p className="font-semibold text-[#6b3f23]">
                  {idea.authorName}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(idea.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <h3 className="font-bold text-lg">{idea.title}</h3>
            <p className="text-sm text-[#5d4037] mt-2 line-clamp-2">
              {idea.shortDescription}
            </p>

            <div className="mt-4">
              <span
                className={`px-3 py-1 text-xs rounded-full font-semibold ${
                  idea.isPaid
                    ? "bg-[#6b3f23] text-white"
                    : "bg-[#66bb6a] text-white"
                }`}
              >
                {idea.isPaid ? `$${idea.price}` : "Free"}
              </span>
            </div>
          </div>
        ))}
      </main>

      {/* ADD IDEA BUTTON */}
      <button
        onClick={() => {
          resetForm();
          setIsEditing(false);
          setShowForm(true);
        }}
        className="fixed bottom-10 right-10 w-16 h-16 rounded-full bg-[#4caf50] text-white text-4xl shadow-xl hover:bg-[#66bb6a] transition"
      >
        +
      </button>

      {/* ADD / EDIT FORM POPUP */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-5 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-2xl"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-4 text-[#4caf50]">
              {isEditing ? "Edit Idea" : "Publish an Idea"}
            </h2>

            <div className="grid gap-4">
              <input
                type="text"
                placeholder="Idea Title *"
                className="border p-3 rounded-lg"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <input
                type="text"
                placeholder="Short Description *"
                className="border p-3 rounded-lg"
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
              />

              <textarea
                placeholder="Full Description *"
                className="border p-3 rounded-lg h-28"
                value={fullDesc}
                onChange={(e) => setFullDesc(e.target.value)}
              ></textarea>

              {/* Paid toggle */}
              <div className="flex items-center gap-4">
                <label className="font-semibold">Paid Idea:</label>
                <input
                  type="checkbox"
                  checked={isPaid}
                  onChange={() => setIsPaid(!isPaid)}
                />
                {isPaid && (
                  <input
                    type="number"
                    placeholder="Price"
                    className="border p-2 rounded-lg w-24"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                )}
              </div>

              {/* Professional File Upload */}
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-[#6b3f23]">
                  Attach File:
                </label>

                <label className="border-2 border-dashed border-[#4caf50] bg-[#f3fbf3] cursor-pointer rounded-xl p-4 flex items-center gap-3 hover:border-[#66bb6a] transition">
                  <i className="fa-solid fa-cloud-arrow-up text-2xl text-[#4caf50]"></i>
                  <div>
                    <p className="font-semibold text-[#4caf50]">
                      Click to upload
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, JPG, PNG (Max 10MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                </label>

                {file && (
                  <p className="text-sm mt-1 text-[#6b3f23]">
                    Selected: <span className="font-semibold">{file.name}</span>
                  </p>
                )}
              </div>

              <button
                onClick={handlePublish}
                className="w-full bg-[#4caf50] text-white py-3 rounded-lg text-lg font-bold hover:bg-[#66bb6a]"
              >
                {isEditing ? "Update Idea" : "Publish Idea"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IDEA VIEW MODAL */}
      {selectedIdea && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-5 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border relative shadow-xl">
            <button
              onClick={() => setSelectedIdea(null)}
              className="absolute top-4 right-4 text-2xl"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-3">{selectedIdea.title}</h2>

            {/* AUTHOR */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-[#4caf50] rounded-full text-white flex items-center justify-center font-bold">
                {getInitials(selectedIdea.authorName)}
              </div>

              <div>
                <p className="font-bold">{selectedIdea.authorName}</p>
                <p className="text-xs text-gray-500">
                  {new Date(selectedIdea.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* RULES: */}
            {/* FREE IDEA → Everyone can see full details */}
            {/* PAID IDEA → Only owner can see full details */}

            {selectedIdea.isPaid ? (
              selectedIdea.authorName === loggedInUser ? (
                <>
                  {/* OWNER of PAID Idea */}
                  <p className="whitespace-pre-wrap mb-4">
                    {selectedIdea.fullDescription}
                  </p>

                  {selectedIdea.file && (
                    <a
                      href={URL.createObjectURL(selectedIdea.file)}
                      download={selectedIdea.file.name}
                      className="text-blue-600 underline block mb-4"
                    >
                      Download Attachment
                    </a>
                  )}

                  <div className="flex gap-4 mt-5">
                    <button
                      onClick={() => handleEdit(selectedIdea)}
                      className="px-4 py-2 bg-[#4caf50] text-white rounded-lg"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(selectedIdea.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* NOT OWNER - CANNOT VIEW PAID IDEA */}
                  <p className="text-gray-600 italic mb-4">
                    This is a paid idea. Purchase required to view full details.
                  </p>

                  <button className="w-full bg-[#6b3f23] text-white py-3 rounded-lg font-bold">
                    Purchase for ${selectedIdea.price}
                  </button>
                </>
              )
            ) : (
              <>
                {/* FREE IDEA → Anyone can view */}
                <p className="whitespace-pre-wrap mb-4">
                  {selectedIdea.fullDescription}
                </p>

                {selectedIdea.file && (
                  <a
                    href={URL.createObjectURL(selectedIdea.file)}
                    download={selectedIdea.file.name}
                    className="text-blue-600 underline block mb-4"
                  >
                    Download Attachment
                  </a>
                )}

                {/* Only owner can edit/delete */}
                {selectedIdea.authorName === loggedInUser && (
                  <div className="flex gap-4 mt-5">
                    <button
                      onClick={() => handleEdit(selectedIdea)}
                      className="px-4 py-2 bg-[#4caf50] text-white rounded-lg"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(selectedIdea.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default IdeaSharing;
