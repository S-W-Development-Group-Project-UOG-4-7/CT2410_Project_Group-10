import { useState } from "react";
import PayHerePayment from "../components/PayHerePayment"; // <-- NEW IMPORT

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function IdeaSharing() {
  const loggedInUser = "Niven Asmitha";

  const [ideas, setIdeas] = useState([
    {
      id: 101,
      title: "Eco-Friendly Coconut Product Finder",
      shortDescription: "Discover sustainable coconut-based products locally.",
      fullDescription:
        "A marketplace app connecting eco-conscious customers with verified coconut sellers.\n\nFeatures:\n- Seller profiles\n- Ratings\n- Map search\n- Secure checkout",
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

  const [showPayment, setShowPayment] = useState(false); // <-- NEW PAYMENT MODAL

  // FORM STATES
  const [title, setTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [fullDesc, setFullDesc] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState(0);
  const [file, setFile] = useState(null);

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
    <div className="min-h-screen bg-[#f9faf7] py-10">
      <h1 className="text-center text-5xl font-bold text-[#6b3f23] mb-12">
        🥥 Idea Sharing Platform
      </h1>

      {/* IDEA GRID */}
      <main className="max-w-7xl mx-auto px-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {ideas.map((idea) => (
          <div
            key={idea.id}
            onClick={() => setSelectedIdea(idea)}
            className="cursor-pointer bg-white border-2 border-[#ece7e1] rounded-2xl p-6 shadow-md hover:shadow-xl hover:border-[#4caf50] transition-all duration-300"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-[#4caf50] text-white rounded-full flex items-center justify-center font-bold text-lg">
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

            <h3 className="font-bold text-xl text-[#6b3f23]">{idea.title}</h3>
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
                {idea.isPaid ? `Rs. ${idea.price}` : "Free"}
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

      {/* --------------------------------------------
           ADD / EDIT FORM
      -------------------------------------------- */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-2xl"
            >
              ✕
            </button>

            <h2 className="text-3xl font-bold mb-6 text-[#4caf50]">
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
                className="border p-3 rounded-lg h-32"
                value={fullDesc}
                onChange={(e) => setFullDesc(e.target.value)}
              ></textarea>

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

              <label className="border-2 border-dashed border-[#4caf50] bg-[#f3fbf3] cursor-pointer rounded-xl p-4 flex items-center gap-3 hover:border-[#66bb6a] transition">
                <span className="text-2xl text-[#4caf50]">📎</span>
                <div>
                  <p className="font-semibold text-[#4caf50]">
                    Click to upload
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
                  Selected: <strong>{file.name}</strong>
                </p>
              )}

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

      {/* --------------------------------------------
           IDEA VIEW MODAL
      -------------------------------------------- */}
      {selectedIdea && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-8 shadow-2xl border relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedIdea(null)}
              className="absolute top-4 right-4 text-3xl"
            >
              ✕
            </button>

            <h2 className="text-3xl font-bold text-[#6b3f23] mb-4">
              {selectedIdea.title}
            </h2>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-[#4caf50] rounded-full text-white flex items-center justify-center font-bold text-xl">
                {getInitials(selectedIdea.authorName)}
              </div>

              <div>
                <p className="font-bold text-lg">{selectedIdea.authorName}</p>
                <p className="text-xs text-gray-500">
                  {new Date(selectedIdea.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* RULE SYSTEM */}
            {selectedIdea.isPaid ? (
              selectedIdea.authorName === loggedInUser ? (
                <>
                  <p className="whitespace-pre-wrap text-gray-700 mb-6">
                    {selectedIdea.fullDescription}
                  </p>

                  {selectedIdea.file && (
                    <a
                      href={URL.createObjectURL(selectedIdea.file)}
                      download={selectedIdea.file.name}
                      className="text-blue-600 underline block mb-6"
                    >
                      Download Attachment
                    </a>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleEdit(selectedIdea)}
                      className="px-5 py-3 bg-[#4caf50] text-white rounded-lg"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(selectedIdea.id)}
                      className="px-5 py-3 bg-red-500 text-white rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* ABSTRACT PREVIEW */}
                  <div className="bg-amber-50 border-l-4 border-amber-600 p-5 rounded-lg mb-6">
                    <p className="text-[#6b3f23] font-semibold mb-2">
                      Abstract Preview:
                    </p>
                    <p className="text-gray-700">
                      {selectedIdea.shortDescription}
                    </p>
                  </div>

                  <button
                    onClick={() => setShowPayment(true)}
                    className="w-full bg-[#6b3f23] text-white py-4 rounded-lg font-bold text-lg"
                  >
                    💳 Purchase for Rs. {selectedIdea.price}
                  </button>
                </>
              )
            ) : (
              <>
                <p className="whitespace-pre-wrap text-gray-700 mb-6">
                  {selectedIdea.fullDescription}
                </p>

                {selectedIdea.file && (
                  <a
                    href={URL.createObjectURL(selectedIdea.file)}
                    download={selectedIdea.file.name}
                    className="text-blue-600 underline block mb-6"
                  >
                    Download Attachment
                  </a>
                )}

                {selectedIdea.authorName === loggedInUser && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleEdit(selectedIdea)}
                      className="px-5 py-3 bg-[#4caf50] text-white rounded-lg"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(selectedIdea.id)}
                      className="px-5 py-3 bg-red-500 text-white rounded-lg"
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

      {/* --------------------------------------------
          PAYMENT MODAL
      -------------------------------------------- */}
      {showPayment && selectedIdea && (
        <PayHerePayment
          idea={selectedIdea}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}

export default IdeaSharing;
