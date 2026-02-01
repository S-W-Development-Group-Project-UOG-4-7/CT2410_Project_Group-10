import React, { useEffect, useMemo, useState } from "react";

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
};

const CreateInvestmentForm = ({
  showCreatePanel,
  setShowCreatePanel,
  creatingProject = false,
  newProject = {},
  setNewProject,
  handleCreateProject,
  submitLabel = "Submit Draft for Review",
  titleText = "Create Investment Opportunity",
  categories = [
    "Coconut Farming",
    "Tea Plantation",
    "Spice Cultivation",
    "Livestock",
    "Aquaculture",
    "Other",
  ],
  locations = [
    "Colombo",
    "Gampaha",
    "Kandy",
    "Galle",
    "Jaffna",
    "Anuradhapura",
    "Other",
  ],
}) => {
  const [activeTab, setActiveTab] = useState("project");
  const [imageFileName, setImageFileName] = useState("");
  const [businessPlanFileName, setBusinessPlanFileName] = useState("");

  const isFormValid = useMemo(() => {
    return (
      Number(newProject.roi) > 0 &&
      Number(newProject.duration) > 0 &&
      (newProject.investment_type === "loan" ||
        Number(newProject.total_units) > 0)
    );
  }, [newProject]);

  useEffect(() => {
    if (!showCreatePanel) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow || "auto";
    };
  }, [showCreatePanel]);

  if (!showCreatePanel) return null;

  const handleClose = () => {
    setShowCreatePanel(false);
    setActiveTab("project");
    setImageFileName("");
    setBusinessPlanFileName("");
  };

  const pricePerShare =
    Number(newProject.target_amount) && Number(newProject.total_units)
      ? Math.round(
          Number(newProject.target_amount) / Number(newProject.total_units),
        )
      : 0;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Modal Panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
        <div
          className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl transform transition-all duration-300 scale-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 md:p-10">
            {/* Header */}
            <div
              className="flex justify-between items-center mb-8 pb-5 border-b"
              style={{ borderColor: COLORS.border }}
            >
              <h2
                className="text-2xl md:text-3xl font-bold tracking-tight"
                style={{ color: COLORS.textPrimary }}
              >
                {activeTab === "project" ? titleText : "Investment Terms"}
              </h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <svg
                  className="w-7 h-7 text-gray-600"
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
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-50 rounded-2xl p-1.5 mb-10 shadow-sm">
              <button
                onClick={() => setActiveTab("project")}
                className={`flex-1 py-3.5 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === "project"
                    ? "bg-white shadow-md text-[#4CAF50] font-semibold scale-[1.02]"
                    : "text-gray-600 hover:text-gray-800 hover:bg-white/60"
                }`}
              >
                Project Information
              </button>
              <button
                onClick={() => setActiveTab("investment")}
                className={`flex-1 py-3.5 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === "investment"
                    ? "bg-white shadow-md text-[#4CAF50] font-semibold scale-[1.02]"
                    : "text-gray-600 hover:text-gray-800 hover:bg-white/60"
                }`}
              >
                Investment Details
              </button>
            </div>

            {/* PROJECT TAB CONTENT */}
            {activeTab === "project" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Left Column */}
                <div className="space-y-8">
                  {/* Basic Info */}
                  <div className="space-y-6">
                    <h4
                      className="text-xl font-bold"
                      style={{ color: COLORS.accent }}
                    >
                      Basic Information
                    </h4>

                    <div className="space-y-6">
                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: COLORS.textSecondary }}
                        >
                          Project Title *
                        </label>
                        <input
                          type="text"
                          value={newProject.title || ""}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              title: e.target.value,
                            })
                          }
                          className="w-full px-5 py-4 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/40 transition-all duration-200 bg-white/50"
                          style={{ borderColor: COLORS.border }}
                          placeholder="e.g. Organic Coconut Oil Production Unit"
                          required
                        />
                      </div>

                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: COLORS.textSecondary }}
                        >
                          Description *
                        </label>
                        <textarea
                          value={newProject.description || ""}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              description: e.target.value,
                            })
                          }
                          className="w-full px-5 py-4 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/40 transition-all duration-200 min-h-[140px] resize-y bg-white/50"
                          style={{ borderColor: COLORS.border }}
                          placeholder="Describe your project, goals, timeline, and how funds will be used..."
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label
                            className="block text-sm font-medium mb-2"
                            style={{ color: COLORS.textSecondary }}
                          >
                            Category *
                          </label>
                          <select
                            value={newProject.category || ""}
                            onChange={(e) =>
                              setNewProject({
                                ...newProject,
                                category: e.target.value,
                              })
                            }
                            className="w-full px-5 py-4 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/40 transition-all duration-200 bg-white/50"
                            style={{ borderColor: COLORS.border }}
                          >
                            <option value="" disabled>
                              Select category
                            </option>
                            {categories.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label
                            className="block text-sm font-medium mb-2"
                            style={{ color: COLORS.textSecondary }}
                          >
                            Location *
                          </label>
                          <select
                            value={newProject.location || ""}
                            onChange={(e) =>
                              setNewProject({
                                ...newProject,
                                location: e.target.value,
                              })
                            }
                            className="w-full px-5 py-4 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/40 transition-all duration-200 bg-white/50"
                            style={{ borderColor: COLORS.border }}
                          >
                            <option value="" disabled>
                              Select location
                            </option>
                            {locations.map((loc) => (
                              <option key={loc} value={loc}>
                                {loc}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: COLORS.textSecondary }}
                        >
                          Tags (comma separated)
                        </label>
                        <input
                          type="text"
                          value={newProject.tags || ""}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              tags: e.target.value,
                            })
                          }
                          className="w-full px-5 py-4 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/40 transition-all duration-200 bg-white/50"
                          style={{ borderColor: COLORS.border }}
                          placeholder="organic, sustainable, export, coconut, eco-friendly"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Farmer Info */}
                  <div className="space-y-6">
                    <h4
                      className="text-xl font-bold"
                      style={{ color: COLORS.accent }}
                    >
                      Farmer / Entrepreneur
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: COLORS.textSecondary }}
                        >
                          Name *
                        </label>
                        <input
                          type="text"
                          value={newProject.farmer_name || ""}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              farmer_name: e.target.value,
                            })
                          }
                          className="w-full px-5 py-4 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/40 transition-all duration-200 bg-white/50"
                          style={{ borderColor: COLORS.border }}
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: COLORS.textSecondary }}
                        >
                          Years of Experience *
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={newProject.farmer_experience || ""}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              farmer_experience: Number(e.target.value) || 0,
                            })
                          }
                          className="w-full px-5 py-4 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/40 transition-all duration-200 bg-white/50"
                          style={{ borderColor: COLORS.border }}
                          placeholder="e.g. 7"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column — Investment Basics + Files */}
                <div className="space-y-8">
                  <div className="space-y-6">
                    <h4
                      className="text-xl font-bold"
                      style={{ color: COLORS.accent }}
                    >
                      Investment Basics
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: COLORS.textSecondary }}
                        >
                          Expected ROI (%)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="1"
                          value={newProject.roi || ""}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              roi: Number(e.target.value),
                            })
                          }
                          className="w-full px-5 py-4 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/40 transition-all duration-200 bg-white/50"
                          style={{ borderColor: COLORS.border }}
                        />
                      </div>
                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: COLORS.textSecondary }}
                        >
                          Duration (months)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={newProject.duration || ""}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              duration: Number(e.target.value),
                            })
                          }
                          className="w-full px-5 py-4 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/40 transition-all duration-200 bg-white/50"
                          style={{ borderColor: COLORS.border }}
                        />
                      </div>
                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: COLORS.textSecondary }}
                        >
                          Target Amount (LKR)
                        </label>
                        <input
                          type="number"
                          min="100000"
                          step="10000"
                          value={newProject.target_amount || ""}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              target_amount: Number(e.target.value),
                            })
                          }
                          className="w-full px-5 py-4 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/40 transition-all duration-200 bg-white/50"
                          style={{ borderColor: COLORS.border }}
                          placeholder="e.g. 5,000,000"
                        />
                      </div>
                    </div>

                    {newProject.investment_type === "equity" && (
                      <div className="mb-6">
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: COLORS.textSecondary }}
                        >
                          Total Number of Shares
                        </label>
                        <input
                          type="number"
                          min="100"
                          step="100"
                          value={newProject.total_units || ""}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              total_units: Number(e.target.value),
                            })
                          }
                          className="w-full px-5 py-4 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/40 transition-all duration-200 bg-white/50"
                          style={{ borderColor: COLORS.border }}
                        />
                        {pricePerShare > 0 && (
                          <p className="text-sm mt-3 text-gray-600">
                            Price per share:{" "}
                            <strong className="text-[#4CAF50]">
                              LKR {pricePerShare.toLocaleString()}
                            </strong>
                          </p>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label
                          className="block text-sm font-medium mb-3"
                          style={{ color: COLORS.textSecondary }}
                        >
                          Investment Type
                        </label>
                        <div className="flex gap-6">
                          {["equity", "loan"].map((type) => (
                            <label
                              key={type}
                              className="flex items-center gap-3 cursor-pointer group"
                            >
                              <input
                                type="radio"
                                name="investment_type"
                                value={type}
                                checked={newProject.investment_type === type}
                                onChange={(e) =>
                                  setNewProject({
                                    ...newProject,
                                    investment_type: e.target.value,
                                  })
                                }
                                className="w-5 h-5 text-[#4CAF50] border-gray-300 focus:ring-[#4CAF50]"
                              />
                              <span className="text-base group-hover:text-[#4CAF50] transition-colors capitalize">
                                {type}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label
                          className="block text-sm font-medium mb-3"
                          style={{ color: COLORS.textSecondary }}
                        >
                          Risk Level
                        </label>
                        <div className="flex gap-3">
                          {["low", "medium", "high"].map((risk) => (
                            <button
                              key={risk}
                              type="button"
                              onClick={() =>
                                setNewProject({
                                  ...newProject,
                                  risk_level: risk,
                                })
                              }
                              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 border ${
                                newProject.risk_level === risk
                                  ? risk === "low"
                                    ? "bg-green-50 text-green-800 border-green-300"
                                    : risk === "medium"
                                      ? "bg-yellow-50 text-yellow-800 border-yellow-300"
                                      : "bg-red-50 text-red-800 border-red-300 shadow-sm"
                                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              {risk.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* File Uploads */}
                  <div className="space-y-6">
                    <h4
                      className="text-xl font-bold"
                      style={{ color: COLORS.accent }}
                    >
                      Supporting Documents
                    </h4>

                    <div className="space-y-6">
                      {/* Project Image */}
                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: COLORS.textSecondary }}
                        >
                          Project Image (recommended)
                        </label>
                        <label className="relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-200 group overflow-hidden">
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              setNewProject({
                                ...newProject,
                                image: file || null,
                              });
                              setImageFileName(file ? file.name : "");
                            }}
                          />
                          <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                            <svg
                              className="w-10 h-10 mb-3 text-gray-400 group-hover:text-[#4CAF50] transition-colors"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                            <p className="mb-2 text-sm text-gray-500 group-hover:text-[#4CAF50] transition-colors">
                              <span className="font-semibold">
                                Click to upload
                              </span>{" "}
                              or drag & drop
                            </p>
                            <p className="text-xs text-gray-400">
                              PNG, JPG, WEBP (max. 5MB)
                            </p>
                          </div>
                          {imageFileName && (
                            <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs text-gray-700 truncate">
                              {imageFileName}
                            </div>
                          )}
                        </label>
                      </div>

                      {/* Business Plan */}
                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: COLORS.textSecondary }}
                        >
                          Business Plan (PDF)
                        </label>
                        <label className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-200 group overflow-hidden">
                          <input
                            type="file"
                            accept=".pdf"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              setNewProject({
                                ...newProject,
                                business_plan: file || null,
                              });
                              setBusinessPlanFileName(file ? file.name : "");
                            }}
                          />
                          <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                            <svg
                              className="w-8 h-8 mb-2 text-gray-400 group-hover:text-[#4CAF50] transition-colors"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            <p className="mb-1 text-sm text-gray-500 group-hover:text-[#4CAF50] transition-colors">
                              <span className="font-semibold">
                                Click to upload
                              </span>{" "}
                              PDF
                            </p>
                            <p className="text-xs text-gray-400">Max 10MB</p>
                          </div>
                          {businessPlanFileName && (
                            <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs text-gray-700 truncate">
                              {businessPlanFileName}
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "investment" && (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
                <h4
                  className="text-2xl font-bold mb-5"
                  style={{ color: COLORS.accent }}
                >
                  Investment Terms
                </h4>
                <p className="text-gray-600 max-w-2xl mx-auto mb-8 text-lg">
                  Detailed investment conditions, repayment schedule,
                  milestones, profit sharing, exit strategy, etc. will appear
                  here in the next version.
                </p>
                <p className="text-sm text-gray-500">
                  ← Swipe right to return to project details
                </p>
              </div>
            )}

            {/* Footer Buttons */}
            <div
              className="flex flex-col sm:flex-row gap-4 mt-12 pt-8 border-t"
              style={{ borderColor: COLORS.border }}
            >
              <button
                onClick={handleClose}
                className="flex-1 py-4 px-8 border-2 rounded-2xl font-medium text-lg transition-all hover:bg-gray-50 active:scale-[0.98]"
                style={{
                  borderColor: COLORS.border,
                  color: COLORS.textPrimary,
                }}
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  const payload = {
                    needs_investment: true,
                    expected_roi: Number(newProject.roi) || null,
                    duration_months: Number(newProject.duration) || null,
                    investment_type: newProject.investment_type || null,
                    total_stocks:
                      newProject.investment_type === "equity"
                        ? Number(newProject.total_units) || null
                        : null,
                  };

                  console.log("🚀 FINAL INVESTMENT PAYLOAD:", payload);
                  handleCreateProject(payload);
                  setShowCreatePanel(false); // ← closes modal
                }}
                disabled={creatingProject || !isFormValid}
                className={`flex-1 py-4 px-8 rounded-2xl font-semibold text-white text-lg transition-all flex items-center justify-center gap-3 shadow-lg ${
                  creatingProject || !isFormValid
                    ? "opacity-60 cursor-not-allowed bg-gray-400 shadow-none"
                    : "bg-[#4CAF50] hover:bg-[#43A047] hover:shadow-xl active:scale-[0.98]"
                }`}
              >
                {creatingProject ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  submitLabel
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateInvestmentForm;