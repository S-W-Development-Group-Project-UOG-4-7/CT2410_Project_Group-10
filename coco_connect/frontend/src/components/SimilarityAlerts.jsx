import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000/api";

export default function SimilarityAlerts({ onClose }) {
  const token = localStorage.getItem("access");

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedAlert, setSelectedAlert] = useState(null);
  const [openIdea, setOpenIdea] = useState(null);
  const [ideaLoading, setIdeaLoading] = useState(false);
  const [error, setError] = useState(null);

  // =========================
  // LOAD ALERTS
  // =========================
  const loadAlerts = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/alerts/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Unauthorized");

      const data = await res.json();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  // =========================
  // OPEN SIMILAR IDEA - FIXED VERSION
  // =========================
  const openSimilarIdea = async (alert) => {
    if (!alert?.similar_idea?.id) {
      setError("Invalid similar idea");
      return;
    }

    setSelectedAlert(alert);
    setIdeaLoading(true);
    setOpenIdea(null);
    setError(null);

    try {
      const res = await fetch(`${API}/ideas/${alert.similar_idea.id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Not found");

      const data = await res.json();
      setOpenIdea(data);
    } catch (err) {
      setError("Failed to load idea details");
    } finally {
      setIdeaLoading(false);
    }
  };

  // =========================
  // REPORT IDEA
  // =========================
  const reportIdea = async () => {
    if (!selectedAlert) return;

    try {
      // 1) REPORT
      await fetch(`${API}/alerts/${selectedAlert.id}/report/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // 2) DISMISS (remove from list)
      await fetch(`${API}/alerts/${selectedAlert.id}/dismiss/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("✅ Idea reported successfully");
      setSelectedAlert(null);
      setOpenIdea(null);
      loadAlerts();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to report idea");
    }
  };

  // Get similarity color styling
  const getSimilarityColor = (score) => {
    if (score >= 0.8) return "bg-red-50 text-red-700 border-red-300";
    if (score >= 0.6) return "bg-amber-50 text-amber-700 border-amber-300";
    return "bg-yellow-50 text-yellow-700 border-yellow-300";
  };

  const getSimilarityBadge = (score) => {
    if (score >= 0.8) return { color: "bg-red-500", label: "Critical" };
    if (score >= 0.6) return { color: "bg-amber-500", label: "High" };
    return { color: "bg-yellow-500", label: "Medium" };
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-7xl rounded-2xl shadow-2xl relative max-h-[95vh] flex flex-col overflow-hidden">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 w-10 h-10 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
          aria-label="Close"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* HEADER */}
        <div className="relative px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Similarity Alerts
                </h2>
                <p className="text-sm text-slate-600 mt-0.5">
                  Review and manage flagged content
                </p>
              </div>
            </div>
            {alerts.length > 0 && (
              <div className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold">
                {alerts.length} {alerts.length !== 1 ? "Alerts" : "Alert"}
              </div>
            )}
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="px-8 py-3 bg-red-50 border-b border-red-200 flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-3 h-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-sm text-red-800 font-medium">{error}</span>
          </div>
        )}

        {/* BODY */}
        <div className="flex-1 overflow-hidden bg-slate-50">
          <div className="h-full grid grid-cols-1 lg:grid-cols-5 gap-0">
            {/* LEFT – ALERT LIST */}
            <div className="lg:col-span-2 overflow-y-auto bg-white border-r border-slate-200">
              <div className="p-6 space-y-3">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-32">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
                      <div className="w-16 h-16 border-4 border-slate-900 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                    </div>
                    <p className="text-slate-700 font-medium mt-4">
                      Loading alerts...
                    </p>
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-32 text-center px-4">
                    <div className="w-20 h-20 rounded-2xl bg-emerald-100 flex items-center justify-center text-4xl mb-4">
                      ✓
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      All Clear
                    </h3>
                    <p className="text-slate-600 text-sm max-w-xs">
                      No similarity alerts at the moment. Keep up the great
                      work!
                    </p>
                  </div>
                ) : (
                  alerts.map((a) => {
                    const isSelected = selectedAlert?.id === a.id;
                    const badge = getSimilarityBadge(a.similarity_score);

                    return (
                      <div
                        key={a.id}
                        className={`relative border rounded-xl p-4 transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "border-slate-900 bg-slate-50 shadow-md"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                        }`}
                        onClick={() => openSimilarIdea(a)}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div
                            className={`w-2 h-2 rounded-full ${badge.color} mt-2 flex-shrink-0`}
                          ></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span
                                className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getSimilarityColor(
                                  a.similarity_score
                                )}`}
                              >
                                {Math.round(a.similarity_score * 100)}% Match
                              </span>
                              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold">
                                {badge.label}
                              </span>
                              {a.is_reported && (
                                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-semibold flex items-center gap-1">
                                  <svg
                                    className="w-3 h-3"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Reported
                                </span>
                              )}
                            </div>
                            {/* FIXED: Show title instead of ID */}
                            <h4 className="font-semibold text-slate-900 line-clamp-2 text-sm leading-snug">
                              {a.similar_idea?.title}
                            </h4>
                            <p className="text-xs text-slate-500">
                              by {a.similar_idea?.author_email}
                            </p>
                          </div>
                          <svg
                            className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                              isSelected
                                ? "text-slate-900 translate-x-0.5"
                                : "text-slate-400"
                            }`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT – IDEA DISPLAY */}
            <div className="lg:col-span-3 bg-white flex flex-col">
              {!openIdea && !ideaLoading && (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    Select an Alert
                  </h3>
                  <p className="text-slate-600 max-w-md text-sm">
                    Click on any alert from the list to view the similar idea
                    and take appropriate action
                  </p>
                </div>
              )}

              {ideaLoading && (
                <div className="flex-1 flex flex-col items-center justify-center p-12">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-slate-900 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                  </div>
                  <p className="text-slate-800 font-semibold">
                    Loading idea details...
                  </p>
                </div>
              )}

              {openIdea && (
                <>
                  <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-3xl">
                      <div className="mb-6">
                        <h3 className="text-3xl font-bold text-slate-900 mb-4 leading-tight">
                          {openIdea.title}
                        </h3>

                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white font-semibold shadow-md">
                            {openIdea.author_email?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs text-slate-500 font-medium">
                              Author
                            </div>
                            <div className="font-semibold text-slate-900">
                              {openIdea.author_email}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-200 pt-6">
                        <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
                          Description
                        </h4>
                        <div className="prose prose-slate max-w-none">
                          <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                            {openIdea.full_description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 bg-white p-6 flex gap-3">
                    <button
                      onClick={reportIdea}
                      className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      Report Idea
                    </button>

                    <button
                      onClick={() => {
                        setOpenIdea(null);
                        setSelectedAlert(null);
                      }}
                      className="px-8 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors duration-200"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
