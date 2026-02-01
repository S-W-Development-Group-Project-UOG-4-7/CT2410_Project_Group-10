// src/components/CreateProjectModal.jsx
import React from "react";

const CreateProjectModal = ({
  showCreatePanel,
  setShowCreatePanel,
  creatingProject,
  newProject,
  setNewProject,
  handleCreateProject,
  formatCurrency,
}) => {
  if (!showCreatePanel) return null;

  const handleClose = () => {
    setShowCreatePanel(false);
    setNewProject({
      title: "",
      description: "",
      farmer_name: "",
      farmer_experience: "",
      farmer_rating: 4.5,
      roi: 15,
      duration: 12,
      target_amount: "",
      investment_type: "equity",
      risk_level: "medium",
      tags: "",
      image: null,
      business_plan: null,
      additional_docs: null,
      total_units: 1000,
    });
  };

  const isFormValid = () => {
    return (
      newProject.title &&
      newProject.description &&
      newProject.farmer_name &&
      newProject.target_amount &&
      (newProject.investment_type !== "equity" || newProject.total_units)
    );
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose}></div>

      {/* Centered Panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
          <div className="p-6">
            {/* Panel Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-accent5">
              <h3 className="text-2xl font-bold text-accent6">Create New Project</h3>
              <button onClick={handleClose} className="text-accent3 hover:text-accent6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Basic Information */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-accent6 mb-4 text-lg">Basic Information</h4>

                  {/* Project Title */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-accent6 mb-2">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      className="w-full px-4 py-3 border border-accent3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary text-accent6"
                      placeholder="e.g., Organic Coconut Oil Production Unit"
                      required
                    />
                  </div>

                  {/* Project Description */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-accent6 mb-2">
                      Project Description *
                    </label>
                    <textarea
                      value={newProject.description}
                      onChange={(e) =>
                        setNewProject({ ...newProject, description: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-accent3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary text-accent6"
                      rows="4"
                      placeholder="Describe your project in detail..."
                      required
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-accent6 mb-2">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={newProject.tags}
                      onChange={(e) => setNewProject({ ...newProject, tags: e.target.value })}
                      className="w-full px-4 py-3 border border-accent3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary text-accent6"
                      placeholder="e.g., Organic, Sustainable, Export"
                    />
                  </div>
                </div>

                {/* Farmer Information */}
                <div>
                  <h4 className="font-bold text-accent6 mb-4 text-lg">
                    Farmer/Entrepreneur Information
                  </h4>
                  <div className="bg-accent4 p-4 rounded-lg border border-accent5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-accent6 mb-2">
                          Name *
                        </label>
                        <input
                          type="text"
                          value={newProject.farmer_name}
                          onChange={(e) =>
                            setNewProject({ ...newProject, farmer_name: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-accent3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary text-accent6"
                          placeholder="Your name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-accent6 mb-2">
                          Years of Experience *
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={newProject.farmer_experience}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              farmer_experience: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-accent3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary text-accent6"
                          placeholder="e.g., 5"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Investment Details */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-accent6 mb-4 text-lg">Investment Details</h4>

                  {/* ROI, Duration, Target Amount */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-accent6 mb-2">
                        Expected ROI (%) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        step="0.5"
                        value={newProject.roi}
                        onChange={(e) => setNewProject({ ...newProject, roi: e.target.value })}
                        className="w-full px-4 py-3 border border-accent3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary text-accent6"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-accent6 mb-2">
                        Duration (Months) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={newProject.duration}
                        onChange={(e) =>
                          setNewProject({ ...newProject, duration: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-accent3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary text-accent6"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-accent6 mb-2">
                        Target Amount (LKR) *
                      </label>
                      <input
                        type="number"
                        min="100000"
                        step="10000"
                        value={newProject.target_amount}
                        onChange={(e) =>
                          setNewProject({ ...newProject, target_amount: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-accent3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary text-accent6"
                        placeholder="e.g., 5000000"
                        required
                      />
                    </div>
                  </div>

                  {/* Total Shares for Equity Projects */}
                  {newProject.investment_type === "equity" && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-accent6 mb-2">
                        Total Number of Shares *
                      </label>
                      <input
                        type="number"
                        min="100"
                        step="100"
                        value={newProject.total_units}
                        onChange={(e) =>
                          setNewProject({ ...newProject, total_units: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-accent3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary text-accent6"
                        placeholder="e.g., 1000 shares"
                        required
                      />
                      <p className="text-xs text-accent3 mt-1">
                        Price per share will be calculated automatically:{" "}
                        {newProject.target_amount && newProject.total_units
                          ? formatCurrency(
                              Math.round(
                                Number(newProject.target_amount) /
                                  Number(newProject.total_units)
                              )
                            )
                          : "0"}{" "}
                        per share
                      </p>
                    </div>
                  )}

                  {/* Investment Type and Risk Level */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-accent6 mb-2">
                        Investment Type *
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="newInvestmentType"
                            value="equity"
                            checked={newProject.investment_type === "equity"}
                            onChange={(e) =>
                              setNewProject({ ...newProject, investment_type: e.target.value })
                            }
                            className="mr-2 text-secondary"
                          />
                          <span className="text-accent6">Equity (Share Investment)</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="newInvestmentType"
                            value="loan"
                            checked={newProject.investment_type === "loan"}
                            onChange={(e) =>
                              setNewProject({ ...newProject, investment_type: e.target.value })
                            }
                            className="mr-2 text-secondary"
                          />
                          <span className="text-accent6">Loan</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-accent6 mb-2">
                        Risk Level *
                      </label>
                      <div className="flex gap-2">
                        {["low", "medium", "high"].map((risk) => (
                          <button
                            key={risk}
                            type="button"
                            className={`flex-1 py-3 px-3 rounded-lg text-sm font-medium ${
                              newProject.risk_level === risk
                                ? risk === "low"
                                  ? "bg-green-100 text-green-800 border border-green-300"
                                  : risk === "medium"
                                  ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                                  : "bg-red-100 text-red-800 border border-red-300"
                                : "bg-accent4 text-accent6 hover:bg-accent5"
                            }`}
                            onClick={() => setNewProject({ ...newProject, risk_level: risk })}
                          >
                            {risk.charAt(0).toUpperCase() + risk.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* File Uploads */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-accent6 mb-2">
                        Project Image (Optional)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setNewProject({ ...newProject, image: e.target.files?.[0] || null })
                        }
                        className="w-full px-4 py-3 border border-accent3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary text-accent6"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-accent6 mb-2">
                        Business Plan (PDF/DOC) (Optional)
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            business_plan: e.target.files?.[0] || null,
                          })
                        }
                        className="w-full px-4 py-3 border border-accent3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary text-accent6"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-accent6 mb-2">
                        Additional Documents (Optional)
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.png"
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            additional_docs: e.target.files?.[0] || null,
                          })
                        }
                        className="w-full px-4 py-3 border border-accent3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary text-accent6"
                      />
                    </div>
                  </div>
                </div>

                {/* Terms and Information */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-800 mb-2">Important Information</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Your project will be reviewed by our team before being published</li>
                    <li>• Ensure all information provided is accurate and truthful</li>
                    <li>• You must have legal rights to the land/business</li>
                    <li>• Returns to investors must be paid as promised</li>
                    <li>• Project updates must be provided quarterly</li>
                    {newProject.investment_type === "equity" && (
                      <li>• For equity projects, profits will be distributed based on share ownership</li>
                    )}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleClose}
                    className="flex-1 py-3 px-4 border border-accent3 text-accent6 rounded-lg hover:bg-accent4 transition-colors font-medium"
                    disabled={creatingProject}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleCreateProject}
                    disabled={creatingProject || !isFormValid()}
                    className={`flex-1 py-3 px-4 bg-primary text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 ${
                      creatingProject || !isFormValid()
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-accent2"
                    }`}
                  >
                    {creatingProject ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Submit for Review
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS for animation */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default CreateProjectModal;
