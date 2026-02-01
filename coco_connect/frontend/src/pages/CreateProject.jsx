import { useEffect, useMemo, useState } from "react";
import { useSwipeable } from "react-swipeable";
import CreateInvestmentForm from "../components/CreateInvestmentForm";

const API = "http://127.0.0.1:8000/api";

const COLORS = {
  primary: "#4CAF50",
  primaryDark: "#43A047",
  primaryLight: "#E8F5E9",
  accent: "#2E7D32",
  textPrimary: "#1F2937",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  bgPage: "#F9FAFB",
  bgCard: "#FFFFFF",
  danger: "#EF4444",
  success: "#10B981",
  warning: "#F59E0B",
};

/* ================= HELPERS ================= */
const getInitials = (name = "U") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function CreateProject() {
  const [activeTab, setActiveTab] = useState("create");

  // ideas
  const [ideas, setIdeas] = useState([]);
  const [ideaSearch, setIdeaSearch] = useState("");
  const [previewIdea, setPreviewIdea] = useState(null);
  const [selectedIdea, setSelectedIdea] = useState(null);

  // publish form
  const [project, setProject] = useState({
    title: "",
    description: "",
    location: "Colombo",
  });

  const [materials, setMaterials] = useState([{ name: "", quantity: "" }]);

  // investment toggle + modal
  const [needsInvestment, setNeedsInvestment] = useState(false);
  const [showInvestmentForm, setShowInvestmentForm] = useState(false);

  // investment data (collected from modal)
  const [investmentData, setInvestmentData] = useState({
    roi: "",
    duration: "",
    investment_type: "loan",
    total_units: "",
  });

  // projects list
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // drafts list (idea + materials live here)
  const [drafts, setDrafts] = useState([]);
  const [loadingDrafts, setLoadingDrafts] = useState(false);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      setNeedsInvestment(true);
      setShowInvestmentForm(true);
    },
    onSwipedRight: () => {
      setNeedsInvestment(false);
      setShowInvestmentForm(false);
    },
    trackMouse: true,
  });

  // load ideas
  useEffect(() => {
    const loadIdeas = async () => {
      const token = localStorage.getItem("access");
      if (!token) return;

      try {
        const res = await fetch(`${API}/ideas/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setIdeas(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load ideas", err);
      }
    };
    loadIdeas();
  }, []);

  // load projects
  const loadProjects = async () => {
    const token = localStorage.getItem("access");
    setLoadingProjects(true);
    try {
      const res = await fetch(`${API}/projects/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.projects || [];
      setProjects(list);
    } catch (e) {
      console.error("Failed to load projects", e);
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  // load drafts
  const loadDrafts = async () => {
    const token = localStorage.getItem("access");
    if (!token) return;

    setLoadingDrafts(true);
    try {
      const res = await fetch(`${API}/project-drafts/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.drafts || [];
      setDrafts(list);
    } catch (e) {
      console.error("Failed to load drafts", e);
      setDrafts([]);
    } finally {
      setLoadingDrafts(false);
    }
  };

  useEffect(() => {
    if (activeTab === "all") loadProjects();
    if (activeTab === "my") {
      loadProjects();
      loadDrafts(); // ✅ load drafts too
    }
  }, [activeTab]);

  const filteredIdeas = useMemo(() => {
    const q = ideaSearch.toLowerCase();
    return ideas.filter(
      (i) =>
        i.title?.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q) ||
        i.short_description?.toLowerCase().includes(q),
    );
  }, [ideaSearch, ideas]);

  const addMaterial = () =>
    setMaterials((p) => [...p, { name: "", quantity: "" }]);

  const updateMaterial = (i, field, val) => {
    const copy = [...materials];
    copy[i][field] = val;
    setMaterials(copy);
  };

  const removeMaterial = (i) =>
    setMaterials((p) => p.filter((_, idx) => idx !== i));

  const publishProject = async () => {
    if (!selectedIdea) return alert("Select an idea first");
    if (!project.title || !project.description)
      return alert("Fill project details");

    if (needsInvestment) {
      const roiOk = Number(investmentData.roi) > 0;
      const durationOk = Number(investmentData.duration) > 0;
      if (!roiOk || !durationOk) {
        setShowInvestmentForm(true);
        return alert("Please fill investment details first");
      }
    }

    const token = localStorage.getItem("access");
    if (!token) return alert("Please login first");

    const payload = {
      title: project.title,
      description: project.description,
      location: project.location,
      idea: selectedIdea.id,
      needs_investment: needsInvestment,
      materials: materials.map((m) => ({
        name: m.name,
        quantity: Number(m.quantity) || 0,
      })),
      expected_roi: needsInvestment ? Number(investmentData.roi) || null : null,
      duration_months: needsInvestment
        ? Number(investmentData.duration) || null
        : null,
      investment_type: needsInvestment ? investmentData.investment_type : null,
      total_stocks:
        needsInvestment && investmentData.investment_type === "equity"
          ? Number(investmentData.total_units) || null
          : null,
    };

    try {
      const res = await fetch(`${API}/project-drafts/create/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Server returned non-JSON:", text);
        alert("Server error. Check backend logs.");
        return;
      }

      if (!res.ok || !data.success) {
        alert(data.error || "Error publishing project");
        return;
      }

      alert("✅ Project published!");
      await loadProjects();
      setActiveTab("all");

      // reset form
      setSelectedIdea(null);
      setProject({ title: "", description: "", location: "Colombo" });
      setMaterials([{ name: "", quantity: "" }]);
      setNeedsInvestment(false);
      setShowInvestmentForm(false);
      setInvestmentData({
        roi: "",
        duration: "",
        investment_type: "loan",
        total_units: "",
      });
    } catch (err) {
      console.error(err);
      alert("Network error while publishing");
    }
  };

  const onSaveInvestmentTerms = (payload) => {
    setInvestmentData({
      roi: payload.expected_roi ?? "",
      duration: payload.duration_months ?? "",
      investment_type: payload.investment_type || "loan",
      total_units: payload.total_stocks ?? "",
    });
    setNeedsInvestment(true);
    setShowInvestmentForm(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.bgPage }}>
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 py-12">
        {/* HEADER */}
        <header className="mb-12">
          <h1
            className="text-4xl md:text-5xl font-bold tracking-tight"
            style={{ color: COLORS.textPrimary }}
          >
            Projects
          </h1>

          <div
            className="mt-6 inline-flex rounded-full p-1 shadow-sm"
            style={{
              backgroundColor: "#ffffff",
              border: `1px solid ${COLORS.border}`,
            }}
          >
            {["all", "my", "create"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className="px-8 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
                style={{
                  backgroundColor:
                    activeTab === t ? COLORS.primary : "transparent",
                  color: activeTab === t ? "#ffffff" : COLORS.textSecondary,
                  boxShadow:
                    activeTab === t
                      ? "0 4px 12px rgba(76,175,80,0.25)"
                      : "none",
                  transform: activeTab === t ? "scale(1.04)" : "scale(1)",
                }}
              >
                {t === "create"
                  ? "New Project"
                  : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </header>

        {/* ALL / MY PROJECTS */}
        {(activeTab === "all" || activeTab === "my") && (
          <section
            className="rounded-2xl shadow-lg p-6 sm:p-8 md:p-10"
            style={{
              backgroundColor: COLORS.bgCard,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-2xl font-bold"
                style={{ color: COLORS.accent }}
              >
                {activeTab === "my" ? "Your Projects" : "All Projects"}
              </h2>
              <button
                onClick={loadProjects}
                className="px-5 py-2.5 rounded-xl font-medium transition-colors hover:bg-opacity-90"
                style={{
                  backgroundColor: COLORS.primaryLight,
                  color: COLORS.accent,
                }}
              >
                Refresh
              </button>
            </div>

            {loadingProjects ? (
              <p
                className="text-center py-10"
                style={{ color: COLORS.textSecondary }}
              >
                Loading projects...
              </p>
            ) : projects.length === 0 ? (
              <p
                className="text-center py-10"
                style={{ color: COLORS.textSecondary }}
              >
                No projects found.{" "}
                {activeTab === "my" ? "Create one" : "Check back later"}.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((p) => {
                  const progress =
                    p.target_amount > 0
                      ? Math.min(
                          (p.current_amount / p.target_amount) * 100,
                          100,
                        )
                      : 0;
                  const hasInvestment = p.target_amount > 0;

                  return (
                    <div
                      key={p.id}
                      className="rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow duration-200"
                      style={{
                        border: `1px solid ${COLORS.border}`,
                        backgroundColor: "#ffffff",
                      }}
                    >
                      {/* TITLE */}
                      <h3
                        className="text-xl font-bold mb-2"
                        style={{ color: COLORS.textPrimary }}
                      >
                        {p.title}
                      </h3>

                      {/* DESCRIPTION */}
                      <p
                        className="text-sm mb-4 line-clamp-3"
                        style={{ color: COLORS.textSecondary }}
                      >
                        {p.description}
                      </p>

                      {/* TAGS */}
                      <div className="flex flex-wrap gap-2 mb-5">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: COLORS.primaryLight,
                            color: COLORS.accent,
                          }}
                        >
                          📍 {p.location || "Colombo"}
                        </span>

                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100"
                          style={{ color: COLORS.textSecondary }}
                        >
                          {p.status || "Draft"}
                        </span>

                        {p.needs_investment && (
                          <span
                            className="px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: "#FEF3C7",
                              color: "#92400E",
                            }}
                          >
                            Seeking Investment
                          </span>
                        )}
                      </div>

                      {/* INVESTMENT CARD */}
                      {hasInvestment && (
                        <div className="mt-2 p-4 rounded-xl bg-gray-50/70 border border-gray-100">
                          <p
                            className="text-sm font-semibold mb-3"
                            style={{ color: COLORS.textPrimary }}
                          >
                            💰 Investment Overview
                          </p>

                          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                            <div>
                              <span style={{ color: COLORS.textSecondary }}>
                                Target
                              </span>
                              <p className="font-bold">
                                Rs. {Number(p.target_amount).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <span style={{ color: COLORS.textSecondary }}>
                                Raised
                              </span>
                              <p className="font-bold">
                                Rs. {Number(p.current_amount).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="text-sm mb-3">
                            <span style={{ color: COLORS.textSecondary }}>
                              Expected ROI
                            </span>
                            <span className="font-bold ml-1.5">
                              {p.expected_roi}%
                            </span>
                            <span className="mx-2">•</span>
                            <span style={{ color: COLORS.textSecondary }}>
                              Duration
                            </span>
                            <span className="font-bold ml-1.5">
                              {p.duration_months} mo
                            </span>
                          </div>

                          <div className="text-sm mb-4">
                            <span style={{ color: COLORS.textSecondary }}>
                              Type
                            </span>
                            <span className="font-medium capitalize ml-1.5">
                              {p.investment_type}
                            </span>
                            <span className="mx-2">•</span>
                            <span style={{ color: COLORS.textSecondary }}>
                              Investors
                            </span>
                            <span className="font-bold ml-1.5">
                              {p.investors_count || 0}
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="relative pt-1">
                            <div className="overflow-hidden h-2.5 text-xs flex rounded bg-gray-200">
                              <div
                                style={{
                                  width: `${progress}%`,
                                  backgroundColor: COLORS.primary,
                                }}
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center"
                              />
                            </div>
                            <div
                              className="text-right text-xs mt-1"
                              style={{ color: COLORS.textSecondary }}
                            >
                              {progress.toFixed(0)}%
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === "my" && (
              <div className="mt-10">
                <h3
                  className="text-xl font-bold mb-4"
                  style={{ color: COLORS.accent }}
                >
                  My Drafts (Idea + Materials)
                </h3>

                {loadingDrafts ? (
                  <p style={{ color: COLORS.textSecondary }}>
                    Loading drafts...
                  </p>
                ) : drafts.length === 0 ? (
                  <p style={{ color: COLORS.textSecondary }}>
                    No drafts found.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {drafts.map((d) => (
                      <div
                        key={d.id}
                        className="rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow duration-200"
                        style={{
                          border: `1px solid ${COLORS.border}`,
                          backgroundColor: "#fff",
                        }}
                      >
                        <h3
                          className="text-lg font-bold mb-2"
                          style={{ color: COLORS.textPrimary }}
                        >
                          {d.title}
                        </h3>

                        <p
                          className="text-sm mb-3"
                          style={{ color: COLORS.textSecondary }}
                        >
                          {d.description}
                        </p>

                        <div
                          className="text-xs mb-3"
                          style={{ color: COLORS.textSecondary }}
                        >
                          📍 {d.location || "Colombo"}
                        </div>

                        {/* ✅ Used Idea */}
                        {d.idea && (
                          <div className="mt-3 p-3 rounded-xl bg-green-50 border border-green-100">
                            <p
                              className="text-sm font-semibold"
                              style={{ color: COLORS.accent }}
                            >
                              ✅ Used Idea:
                            </p>
                            <p className="text-sm font-bold">{d.idea.title}</p>
                          </div>
                        )}

                        {/* ✅ Materials */}
                        <div className="mt-4">
                          <p
                            className="text-sm font-semibold"
                            style={{ color: COLORS.textPrimary }}
                          >
                            Materials Needed:
                          </p>

                          {d.materials && d.materials.length > 0 ? (
                            <ul
                              className="mt-2 text-sm list-disc list-inside"
                              style={{ color: COLORS.textSecondary }}
                            >
                              {d.materials.map((m, idx) => (
                                <li key={idx}>
                                  {m.name} — {m.quantity}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p
                              className="text-sm"
                              style={{ color: COLORS.textSecondary }}
                            >
                              No materials added.
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* ──────────────────────────────────────────────── */}
        {/*                  CREATE TAB CONTENT               */}
        {/* ──────────────────────────────────────────────── */}

        {activeTab === "create" && (
          <div className="space-y-10">
            {/* IDEA SELECTION */}
            <section
              className="rounded-2xl shadow-lg p-8 md:p-10 animate-fade-in-up"
              style={{
                backgroundColor: COLORS.bgCard,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <h2
                className="text-2xl font-bold mb-7"
                style={{ color: COLORS.accent }}
              >
                Select an Idea
              </h2>

              <div className="relative mb-7">
                <input
                  className="w-full rounded-xl px-5 py-4 pl-12 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 transition-all"
                  placeholder="Search ideas by title or description..."
                  value={ideaSearch}
                  onChange={(e) => setIdeaSearch(e.target.value)}
                  style={{
                    border: `1px solid ${COLORS.border}`,
                    backgroundColor: "#ffffff",
                  }}
                />
              </div>

              <div className="custom-scrollbar max-h-[420px] space-y-4 overflow-y-auto pr-3">
                {filteredIdeas.length > 0 ? (
                  filteredIdeas.map((idea) => (
                    <div
                      key={idea.id}
                      onClick={() => setPreviewIdea(idea)}
                      className="group cursor-pointer rounded-xl p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-[#4CAF50]/40"
                      style={{
                        border: `1px solid ${COLORS.border}`,
                        backgroundColor: "#ffffff",
                      }}
                    >
                      <h3
                        className="font-semibold text-lg transition-colors group-hover:text-[#4CAF50]"
                        style={{ color: COLORS.textPrimary }}
                      >
                        {idea.title}
                      </h3>
                      <p
                        className="mt-2 text-sm line-clamp-2"
                        style={{ color: COLORS.textSecondary }}
                      >
                        {idea.short_description || idea.description}
                      </p>
                    </div>
                  ))
                ) : (
                  <div
                    className="py-16 text-center"
                    style={{ color: COLORS.textSecondary }}
                  >
                    <p className="text-lg font-medium">No matching ideas</p>
                    <p className="mt-1">Try adjusting your search</p>
                  </div>
                )}
              </div>

              {selectedIdea && (
                <div
                  className="mt-7 rounded-xl p-5 flex items-center gap-4 animate-fade-in shadow-sm"
                  style={{
                    backgroundColor: COLORS.primaryLight,
                    border: `1px solid ${COLORS.primary}`,
                  }}
                >
                  <div
                    className="text-sm font-semibold uppercase tracking-wide"
                    style={{ color: COLORS.accent }}
                  >
                    Selected Idea
                  </div>
                  <div style={{ color: COLORS.primary, fontWeight: 500 }}>
                    {selectedIdea.title}
                  </div>
                </div>
              )}
            </section>

            {/* PROJECT DETAILS */}
            <section
              className="rounded-2xl shadow-lg p-8 md:p-10"
              style={{
                backgroundColor: COLORS.bgCard,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <h2
                className="text-2xl font-bold mb-7"
                style={{ color: COLORS.accent }}
              >
                Project Details
              </h2>

              <div className="space-y-7">
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: COLORS.textSecondary }}
                  >
                    Project Title
                  </label>
                  <input
                    className="w-full rounded-xl px-5 py-4 text-base focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 transition-all"
                    placeholder="Enter a strong project title..."
                    value={project.title}
                    onChange={(e) =>
                      setProject({ ...project, title: e.target.value })
                    }
                    style={{
                      border: `1px solid ${COLORS.border}`,
                      backgroundColor: "#ffffff",
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: COLORS.textSecondary }}
                  >
                    Description
                  </label>
                  <textarea
                    className="w-full rounded-xl px-5 py-4 text-base focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 transition-all min-h-[160px] resize-y"
                    placeholder="Describe your project in detail..."
                    value={project.description}
                    onChange={(e) =>
                      setProject({ ...project, description: e.target.value })
                    }
                    style={{
                      border: `1px solid ${COLORS.border}`,
                      backgroundColor: "#ffffff",
                    }}
                  />
                </div>
              </div>
            </section>

            {/* MATERIALS */}
            <section
              className="rounded-2xl shadow-lg p-8 md:p-10"
              style={{
                backgroundColor: COLORS.bgCard,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <h2
                className="text-2xl font-bold mb-7"
                style={{ color: COLORS.accent }}
              >
                Materials Needed
              </h2>

              <div className="space-y-5">
                {materials.map((m, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row gap-4 items-start sm:items-center"
                  >
                    <input
                      className="flex-1 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 transition-all"
                      placeholder="Material name"
                      value={m.name}
                      onChange={(e) =>
                        updateMaterial(i, "name", e.target.value)
                      }
                      style={{
                        border: `1px solid ${COLORS.border}`,
                        backgroundColor: "#ffffff",
                      }}
                    />
                    <input
                      className="w-full sm:w-40 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 transition-all"
                      placeholder="Quantity"
                      type="number"
                      value={m.quantity}
                      onChange={(e) =>
                        updateMaterial(i, "quantity", e.target.value)
                      }
                      style={{
                        border: `1px solid ${COLORS.border}`,
                        backgroundColor: "#ffffff",
                      }}
                    />
                    <button
                      onClick={() => removeMaterial(i)}
                      className="rounded-xl px-6 py-4 font-medium hover:bg-red-50 transition-colors"
                      style={{
                        backgroundColor: `${COLORS.danger}15`,
                        color: COLORS.danger,
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={addMaterial}
                className="mt-6 font-semibold flex items-center gap-2 hover:text-[#43A047] transition-colors"
                style={{ color: COLORS.primary }}
              >
                <span className="text-xl font-bold leading-none">+</span>
                Add Another Material
              </button>
            </section>

            {/* INVESTMENT TOGGLE */}
            <section
              className="rounded-2xl shadow-lg p-8 md:p-10"
              style={{
                backgroundColor: COLORS.bgCard,
                border: `1px solid ${COLORS.border}`,
              }}
              {...swipeHandlers}
            >
              <h2
                className="text-2xl font-bold mb-7"
                style={{ color: COLORS.accent }}
              >
                Investment Requirements
              </h2>

              <div
                className="inline-flex rounded-full p-1.5 mb-8"
                style={{ backgroundColor: COLORS.border }}
              >
                <button
                  onClick={() => {
                    setNeedsInvestment(false);
                    setShowInvestmentForm(false);
                  }}
                  className="px-8 py-3 rounded-full font-medium transition-colors"
                  style={{
                    backgroundColor: !needsInvestment
                      ? "#ffffff"
                      : "transparent",
                    color: !needsInvestment
                      ? COLORS.textPrimary
                      : COLORS.textSecondary,
                  }}
                >
                  No Investment Needed
                </button>
                <button
                  onClick={() => {
                    setNeedsInvestment(true);
                    setShowInvestmentForm(true);
                  }}
                  className="px-8 py-3 rounded-full font-medium transition-colors"
                  style={{
                    backgroundColor: needsInvestment
                      ? COLORS.primary
                      : "transparent",
                    color: needsInvestment ? "#ffffff" : COLORS.textSecondary,
                  }}
                >
                  Seeking Investment
                </button>
              </div>
            </section>

            {/* PUBLISH BUTTON */}
            <button
              onClick={publishProject}
              className="w-full rounded-2xl py-5 text-lg font-semibold text-white shadow-xl hover:bg-[#43A047] transition-all duration-300"
              style={{
                backgroundColor: COLORS.primary,
                boxShadow: "0 6px 20px rgba(76,175,80,0.3)",
              }}
            >
              Publish Project
            </button>
          </div>
        )}
      </div>

      {/* IDEA PREVIEW MODAL */}
      {previewIdea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div
            className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 md:p-10">
              <div className="flex items-start gap-5 mb-8">
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white font-bold text-2xl shadow-md"
                  style={{
                    background: "linear-gradient(135deg, #4CAF50, #2E7D32)",
                  }}
                >
                  {getInitials(previewIdea.author_name || "U")}
                </div>
                <div>
                  <p
                    className="text-xl font-semibold"
                    style={{ color: COLORS.textPrimary }}
                  >
                    {previewIdea.author_name || "Anonymous"}
                  </p>
                  <p
                    className="text-sm mt-1"
                    style={{ color: COLORS.textSecondary }}
                  >
                    {previewIdea.author_email || "No email provided"}
                  </p>
                </div>
              </div>

              <h2
                className="mb-6 text-3xl md:text-4xl font-bold leading-tight"
                style={{ color: COLORS.textPrimary }}
              >
                {previewIdea.title}
              </h2>

              <div
                className="prose prose-lg max-w-none leading-relaxed"
                style={{ color: COLORS.textPrimary }}
              >
                {previewIdea.full_description ||
                  previewIdea.description ||
                  "No detailed description available."}
              </div>

              <div className="mt-10 flex justify-end gap-4">
                <button
                  onClick={() => setPreviewIdea(null)}
                  className="px-8 py-3.5 rounded-2xl font-medium text-gray-700 hover:bg-gray-100"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedIdea(previewIdea);
                    setPreviewIdea(null);
                  }}
                  className="px-8 py-3.5 bg-[#4CAF50] text-white rounded-2xl font-semibold hover:bg-[#43A047] transition-colors"
                >
                  Use This Idea
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INVESTMENT MODAL */}
      <CreateInvestmentForm
        showCreatePanel={showInvestmentForm}
        setShowCreatePanel={setShowInvestmentForm}
        creatingProject={false}
        newProject={{
          roi: investmentData.roi,
          duration: investmentData.duration,
          investment_type: investmentData.investment_type,
          total_units: investmentData.total_units,
        }}
        setNewProject={(obj) =>
          setInvestmentData({
            roi: obj.roi ?? investmentData.roi,
            duration: obj.duration ?? investmentData.duration,
            investment_type:
              obj.investment_type ?? investmentData.investment_type,
            total_units: obj.total_units ?? investmentData.total_units,
          })
        }
        handleCreateProject={onSaveInvestmentTerms}
        submitLabel="Save Investment Terms"
        titleText="Investment Details"
      />
    </div>
  );
}