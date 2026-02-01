// InvestmentPage.jsx
// src/pages/InvestmentPage.jsx
import React, { useState, useEffect } from "react";
import CreateInvestmentModal from "../components/CreateInvestmentModal";

const API = "http://127.0.0.1:8000";

const InvestmentPage = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // tab: "all" | "mine"
  const [tab, setTab] = useState("all");
  const [myInvestments, setMyInvestments] = useState([]);
  const [loadingMine, setLoadingMine] = useState(false);

  const [loading, setLoading] = useState(true);
  const [investmentAmount, setInvestmentAmount] = useState(100);

  // Group investment states
  const [groupInvestmentMode, setGroupInvestmentMode] = useState(false);
  const [availableUnits, setAvailableUnits] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);
  const [unitsToPurchase, setUnitsToPurchase] = useState(1);
  const [totalUnits, setTotalUnits] = useState(0);

  const [filters, setFilters] = useState({
    category: "",
    location: "",
    minROI: 0,
    maxROI: 50,
    search: "",
    sortBy: "roi_desc",
    riskLevel: "",
    investmentType: "all",
  });

  // New states for project creation
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);

  /**
   * IMPORTANT:
   * Your backend Create serializer expects:
   *  - expected_roi
   *  - duration_months
   * NOT roi / duration
   */
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    category: "", // should be category PK (id) if your API expects FK id
    location: "Colombo",
    target_amount: "",
    expected_roi: 15,
    duration_months: 12,
    investment_type: "equity",
    risk_level: "medium",
    tags: "",
    image: null,
    business_plan: null,
    additional_docs: null,
    total_units: 1000,
  });

  // Mock data - Fallback if API fails
  const mockProjects = [
    {
      id: 1,
      title: "Organic Coconut Oil Production",
      description: "Small-scale organic coconut oil production unit in Kurunegala",
      category: "Coconut Oil Production",
      location: "Kurunegala",
      farmerName: "R.M. Perera",
      farmerExperience: 8,
      farmerRating: 4.7,
      imageUrl: "",
      roi: 18.5,
      duration: 18,
      targetAmount: 5000000,
      currentAmount: 2500000,
      investorsCount: 12,
      status: "active",
      daysLeft: 45,
      investmentType: "equity",
      riskLevel: "medium",
      createdAt: "2024-01-15",
      tags: ["Organic", "Export", "Sustainable"],
      totalUnits: 5000,
      availableUnits: 2500,
      unitPrice: 1000,
      investmentStructure: "units",
    },
    {
      id: 2,
      title: "Coconut Farm Expansion in Puttalam",
      description: "Expanding existing coconut farm with 500 new trees",
      category: "Coconut Farming",
      location: "Puttalam",
      farmerName: "K.L. Fernando",
      farmerExperience: 12,
      farmerRating: 4.9,
      imageUrl: "",
      roi: 15.2,
      duration: 24,
      targetAmount: 3000000,
      currentAmount: 1800000,
      investorsCount: 8,
      status: "active",
      daysLeft: 60,
      investmentType: "equity",
      riskLevel: "low",
      createdAt: "2024-01-20",
      tags: ["Expansion", "Organic", "Local"],
      totalUnits: 3000,
      availableUnits: 1200,
      unitPrice: 1000,
      investmentStructure: "units",
    },
    {
      id: 3,
      title: "Coir Product Manufacturing Unit",
      description: "Manufacturing coir mats, brushes and other products",
      category: "Coir Products",
      location: "Gampaha",
      farmerName: "S.N. Rajapakse",
      farmerExperience: 6,
      farmerRating: 4.3,
      imageUrl: "",
      roi: 22.5,
      duration: 12,
      targetAmount: 7500000,
      currentAmount: 4500000,
      investorsCount: 15,
      status: "active",
      daysLeft: 30,
      investmentType: "loan",
      riskLevel: "medium",
      createdAt: "2024-01-10",
      tags: ["Manufacturing", "Export", "Employment"],
      investmentStructure: "fixed",
    },
  ];

  // (kept for filters UI; project.category from API is a string name anyway)
  const categories = [
    "All Categories",
    "Coconut Farming",
    "Coconut Oil Production",
    "Coir Products",
    "Coconut Shell Products",
    "Organic Fertilizer",
    "Research & Development",
  ];

  const locations = [
    "All Locations",
    "Colombo",
    "Kandy",
    "Gampaha",
    "Kurunegala",
    "Puttalam",
    "Galle",
    "Matara",
  ];

  // Format currency in Sri Lankan Rupees
  const formatCurrency = (amount) => {
    const n = Number(amount || 0);
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(n)
      .replace("LKR", "RS.");
  };

  const calculateExpectedReturn = (amount, roi, duration) => {
    const monthlyROI = roi / 12 / 100;
    const totalMonths = duration;
    const futureValue = amount * Math.pow(1 + monthlyROI, totalMonths);
    return futureValue.toFixed(2);
  };

  // Calculate unit price from target amount and total units
  const calculateUnitPrice = (targetAmount, totalUnits) => {
    if (!targetAmount || !totalUnits || totalUnits === 0) return 1000;
    return Math.round(targetAmount / totalUnits);
  };

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        if (filters.category && filters.category !== "All Categories") {
          params.append("category", filters.category);
        }

        if (filters.location && filters.location !== "All Locations") {
          params.append("location", filters.location);
        }

        params.append("minROI", filters.minROI.toString());
        params.append("maxROI", filters.maxROI.toString());

        if (filters.riskLevel) params.append("riskLevel", filters.riskLevel);

        if (filters.investmentType && filters.investmentType !== "all") {
          params.append("investmentType", filters.investmentType);
        }

        if (filters.search) params.append("search", filters.search);

        params.append("sortBy", filters.sortBy);
        params.append("status", "active");

        const response = await fetch(`${API}/api/projects/?${params}`);
        if (!response.ok) throw new Error("Failed to fetch projects");

        const data = await response.json();

        if (data.success && data.projects) {
          const apiProjects = data.projects.map((project) => {
            const targetAmount = parseFloat(project.target_amount) || 0;
            const totalUnits = project.total_units || 1000;
            const unitPrice =
              project.unit_price || calculateUnitPrice(targetAmount, totalUnits);

            const currentAmount = parseFloat(project.current_amount) || 0;

            return {
              id: project.id,
              title: project.title,
              description: project.description,
              category: project.category, // name
              location: project.location,

              // ✅ always provide these so UI doesn’t break
              farmerName: project.farmer_name || "Farmer",
              farmerExperience: project.farmer_experience ?? 0,
              farmerRating: project.farmer_rating ?? 4.5,

              imageUrl: "",
              roi: parseFloat(project.roi) || 0, // from serializer (expected_roi)
              duration: project.duration || 12, // from serializer (duration_months)
              targetAmount,
              currentAmount,
              investorsCount: project.investors_count || 0,
              status: project.status || "active",
              daysLeft: project.days_left || 0,
              investmentType: project.investment_type || "equity",
              riskLevel: project.risk_level || "medium",
              createdAt: project.created_at || "2024-01-01",
              tags: Array.isArray(project.tags)
                ? project.tags
                : project.tags
                ? project.tags.split(",")
                : [],
              totalUnits,
              availableUnits:
                project.available_units ??
                Math.floor((targetAmount - currentAmount) / unitPrice),
              unitPrice,
              investmentStructure:
                project.investment_structure ||
                (project.investment_type === "equity" ? "units" : "fixed"),
            };
          });

          setProjects(apiProjects);
          setFilteredProjects(apiProjects);
        } else {
          setProjects(mockProjects);
          setFilteredProjects(mockProjects);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        setProjects(mockProjects);
        setFilteredProjects(mockProjects);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [filters]);

  // Apply filters
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, filters]);

  const applyFilters = () => {
    let filtered = [...projects];

    if (filters.category && filters.category !== "All Categories") {
      filtered = filtered.filter((project) => project.category === filters.category);
    }

    if (filters.location && filters.location !== "All Locations") {
      filtered = filtered.filter((project) => project.location === filters.location);
    }

    filtered = filtered.filter(
      (project) => project.roi >= filters.minROI && project.roi <= filters.maxROI
    );

    if (filters.riskLevel) {
      filtered = filtered.filter((project) => project.riskLevel === filters.riskLevel);
    }

    if (filters.investmentType !== "all") {
      filtered = filtered.filter((project) => project.investmentType === filters.investmentType);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter((project) => {
        const farmer = (project.farmerName || "").toLowerCase();
        return (
          project.title.toLowerCase().includes(searchTerm) ||
          project.description.toLowerCase().includes(searchTerm) ||
          farmer.includes(searchTerm)
        );
      });
    }

    if (filters.sortBy) {
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case "roi_desc":
            return b.roi - a.roi;
          case "roi_asc":
            return a.roi - b.roi;
          case "date_newest":
            return new Date(b.createdAt) - new Date(a.createdAt);
          case "date_oldest":
            return new Date(a.createdAt) - new Date(b.createdAt);
          case "funding_needed":
            return b.targetAmount - b.currentAmount - (a.targetAmount - a.currentAmount);
          case "popularity":
            return b.investorsCount - a.investorsCount;
          case "price_per_share":
            return (a.unitPrice || 0) - (b.unitPrice || 0);
          default:
            return 0;
        }
      });
    }

    setFilteredProjects(filtered);
  };

  // Fetch my investments
  const fetchMyInvestments = async () => {
    const token = localStorage.getItem("access");
    if (!token) {
      alert("Please login to view your investments");
      return;
    }

    setLoadingMine(true);
    try {
      const res = await fetch(`${API}/api/my-investments/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`Failed to load investments: ${data.error || res.statusText}`);
        return;
      }

      setMyInvestments(data.investments || []);
    } catch (e) {
      console.error("Error details:", e);
      alert(`Server error: ${e.message}. Please check if the backend server is running.`);
    } finally {
      setLoadingMine(false);
    }
  };

  // Load mine when tab changes
  useEffect(() => {
    if (tab === "mine") fetchMyInvestments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleInvest = (project) => {
    setSelectedProject(project);
    setInvestmentAmount(
      project.targetAmount - project.currentAmount > 100
        ? 100
        : project.targetAmount - project.currentAmount
    );

    if (project.investmentType === "equity" && project.investmentStructure === "units") {
      setGroupInvestmentMode(true);

      const calculatedUnitPrice =
        project.unitPrice || calculateUnitPrice(project.targetAmount, project.totalUnits);
      const calculatedAvailableUnits =
        project.availableUnits ||
        Math.floor((project.targetAmount - project.currentAmount) / calculatedUnitPrice);

      setUnitPrice(calculatedUnitPrice);
      setAvailableUnits(calculatedAvailableUnits);
      setTotalUnits(project.totalUnits);
      setUnitsToPurchase(1);
    } else {
      setGroupInvestmentMode(false);
    }

    setIsModalOpen(true);
  };

  // Handle confirm investment
  const handleConfirmInvestment = async () => {
    try {
      const token = localStorage.getItem("access");

      if (!token) {
        alert("Please login to make an investment");
        return;
      }

      if (!selectedProject) {
        alert("No project selected");
        return;
      }

      const investmentData = {
        project_id: selectedProject.id,
        amount: investmentAmount,
        payment_method:
          document.querySelector('input[name="paymentMethod"]:checked')?.value || "payhere",
      };

      if (groupInvestmentMode) {
        investmentData.units = unitsToPurchase;
        investmentData.investment_type = "unit_purchase";
        investmentData.investment_structure = "units";
        investmentData.unit_price = unitPrice;
      }

      const response = await fetch(`${API}/api/make-investment/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(investmentData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Investment failed");

      alert("Investment successful!");
      setIsModalOpen(false);

      setFilters((prev) => ({ ...prev }));
    } catch (error) {
      console.error("Investment error:", error);
      alert(`Investment failed: ${error.message}`);
    }
  };

  // ✅ Corrected handleCreateProject (sends expected_roi + duration_months)
  const handleCreateProject = async () => {
    let response;

    try {
      setCreatingProject(true);
      const token = localStorage.getItem("access");

      if (!token) {
        alert("Please login to create a project");
        return;
      }

      const formData = new FormData();

      Object.keys(newProject).forEach((key) => {
        const val = newProject[key];
        if (val === null || val === undefined || val === "") return;

        if (key === "image" || key === "business_plan" || key === "additional_docs") {
          if (val) formData.append(key, val);
          return;
        }

        formData.append(key, String(val));
      });

      // Auto-calc unit_price for equity projects
      if (
        newProject.investment_type === "equity" &&
        newProject.target_amount &&
        newProject.total_units
      ) {
        const calculatedUnitPrice = Math.round(
          Number(newProject.target_amount) / Number(newProject.total_units)
        );
        formData.append("unit_price", String(calculatedUnitPrice));
        formData.append("investment_structure", "units");
      }

      response = await fetch(`${API}/api/create-project/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const raw = await response.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        data = raw;
      }

      if (!response.ok) {
        const msg =
          typeof data === "string"
            ? data
            : data?.error
            ? typeof data.error === "string"
              ? data.error
              : JSON.stringify(data.error, null, 2)
            : JSON.stringify(data, null, 2);

        alert(msg || "Failed to create project");
        return;
      }

      alert("Project created successfully! It will be reviewed by admin.");
      setShowCreatePanel(false);
      setFilters((prev) => ({ ...prev }));
    } catch (error) {
      console.error("Error creating project:", error);
      alert(`Failed to create project: ${error?.message || "Unknown error"}`);
    } finally {
      setCreatingProject(false);
    }
  };

  // Update units to purchase based on amount or vice versa
  const updateUnitsFromAmount = (amount) => {
    if (unitPrice > 0) {
      const calculatedUnits = Math.floor(amount / unitPrice);
      setUnitsToPurchase(Math.max(1, Math.min(calculatedUnits, availableUnits)));
    }
  };

  const updateAmountFromUnits = (units) => {
    const calculatedAmount = units * unitPrice;
    setInvestmentAmount(calculatedAmount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent4 to-accent5 font-nunito">
      {/* Header */}
      <div className="bg-primary text-white py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold font-mont mb-2">
                Investment Opportunities
              </h1>
              <p className="text-lg opacity-90">
                Invest in Sri Lanka's coconut industry. Support local farmers, earn
                transparent returns.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-accent5 sticky top-8">
              <h3 className="text-xl font-bold text-accent6 mb-6 pb-3 border-b border-accent5">
                Filter Projects
              </h3>

              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-accent6 mb-2">
                    Category
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-accent3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary text-accent6"
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    disabled={tab === "mine"}
                    title={tab === "mine" ? "Filters apply to All Projects only" : ""}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-accent6 mb-2">
                    Location
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-accent3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary text-accent6"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    disabled={tab === "mine"}
                    title={tab === "mine" ? "Filters apply to All Projects only" : ""}
                  >
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ROI Range */}
                <div>
                  <label className="block text-sm font-medium text-accent6 mb-2">
                    ROI Range: {filters.minROI}% - {filters.maxROI}%
                  </label>
                  <div className="space-y-4">
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={filters.minROI}
                      onChange={(e) =>
                        setFilters({ ...filters, minROI: parseInt(e.target.value) })
                      }
                      className="w-full h-2 bg-accent3 rounded-lg appearance-none cursor-pointer"
                      disabled={tab === "mine"}
                    />
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={filters.maxROI}
                      onChange={(e) =>
                        setFilters({ ...filters, maxROI: parseInt(e.target.value) })
                      }
                      className="w-full h-2 bg-accent3 rounded-lg appearance-none cursor-pointer"
                      disabled={tab === "mine"}
                    />
                  </div>
                </div>

                {/* Risk Level */}
                <div>
                  <label className="block text-sm font-medium text-accent6 mb-2">
                    Risk Level
                  </label>
                  <div className="flex gap-2">
                    {["", "low", "medium", "high"].map((risk) => (
                      <button
                        key={risk || "all"}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${
                          filters.riskLevel === risk
                            ? risk === "low"
                              ? "bg-green-100 text-green-800 border border-green-300"
                              : risk === "medium"
                              ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                              : risk === "high"
                              ? "bg-red-100 text-red-800 border border-red-300"
                              : "bg-primary text-white"
                            : "bg-accent4 text-accent6 hover:bg-accent5"
                        } ${tab === "mine" ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() => tab !== "mine" && setFilters({ ...filters, riskLevel: risk })}
                        disabled={tab === "mine"}
                      >
                        {risk === "" ? "All" : risk.charAt(0).toUpperCase() + risk.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Investment Type */}
                <div>
                  <label className="block text-sm font-medium text-accent6 mb-2">
                    Investment Type
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="investmentType"
                        value="all"
                        checked={filters.investmentType === "all"}
                        onChange={(e) =>
                          setFilters({ ...filters, investmentType: e.target.value })
                        }
                        className="mr-2 text-secondary"
                        disabled={tab === "mine"}
                      />
                      <span className="text-accent6">All Types</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="investmentType"
                        value="equity"
                        checked={filters.investmentType === "equity"}
                        onChange={(e) =>
                          setFilters({ ...filters, investmentType: e.target.value })
                        }
                        className="mr-2 text-secondary"
                        disabled={tab === "mine"}
                      />
                      <span className="text-accent6">Equity (Shares)</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="investmentType"
                        value="loan"
                        checked={filters.investmentType === "loan"}
                        onChange={(e) =>
                          setFilters({ ...filters, investmentType: e.target.value })
                        }
                        className="mr-2 text-secondary"
                        disabled={tab === "mine"}
                      />
                      <span className="text-accent6">Loan</span>
                    </label>
                  </div>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={() =>
                    setFilters({
                      category: "",
                      location: "",
                      minROI: 0,
                      maxROI: 50,
                      search: "",
                      sortBy: "roi_desc",
                      riskLevel: "",
                      investmentType: "all",
                    })
                  }
                  className={`w-full py-2.5 px-4 border border-accent3 text-accent6 rounded-lg hover:bg-accent4 transition-colors font-medium ${
                    tab === "mine" ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={tab === "mine"}
                >
                  Clear All Filters
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6 mt-6 border border-accent5">
              <h3 className="text-xl font-bold text-accent6 mb-4">Platform Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-accent5">
                  <span className="text-accent6">Total Projects</span>
                  <span className="font-bold text-primary text-lg">{projects.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-accent5">
                  <span className="text-accent6">Total Investment</span>
                  <span className="font-bold text-secondary text-lg">
                    {formatCurrency(projects.reduce((sum, p) => sum + p.currentAmount, 0))}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-accent5">
                  <span className="text-accent6">Average ROI</span>
                  <span className="font-bold text-accent1 text-lg">
                    {projects.length > 0
                      ? (projects.reduce((sum, p) => sum + p.roi, 0) / projects.length).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-accent6">Total Shares</span>
                  <span className="font-bold text-coco text-lg">
                    {projects.reduce((sum, p) => sum + (p.totalUnits || 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Projects Section */}
          <div className="lg:w-3/4">
            {/* Tabs + Search and Sort Bar */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-accent5">
              <div className="flex flex-col gap-4">
                {/* Tabs */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setTab("all")}
                    className={`px-5 py-2 rounded-full font-semibold ${
                      tab === "all" ? "bg-primary text-white" : "bg-accent4 text-accent6"
                    }`}
                  >
                    All Projects
                  </button>
                  <button
                    onClick={() => setTab("mine")}
                    className={`px-5 py-2 rounded-full font-semibold ${
                      tab === "mine" ? "bg-primary text-white" : "bg-accent4 text-accent6"
                    }`}
                  >
                    My Investments
                  </button>
                </div>

                {/* Search + Sort */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="relative w-full md:w-auto md:flex-1">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search projects by title, description, or farmer..."
                        className="w-full pl-12 pr-4 py-3 rounded-full border border-accent3 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary text-accent6"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        disabled={tab === "mine"}
                      />
                      <svg
                        className="w-5 h-5 absolute left-4 top-3.5 text-accent3"
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
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <span className="text-accent6 whitespace-nowrap">Sort by:</span>
                    <select
                      className="px-4 py-2.5 rounded-lg border border-accent3 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary text-accent6"
                      value={filters.sortBy}
                      onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                      disabled={tab === "mine"}
                    >
                      <option value="roi_desc">Highest ROI</option>
                      <option value="roi_asc">Lowest ROI</option>
                      <option value="date_newest">Newest First</option>
                      <option value="funding_needed">Most Funding Needed</option>
                      <option value="popularity">Most Popular</option>
                      <option value="price_per_share">Lowest Price Per Share</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* =========================
                TAB: ALL PROJECTS
            ========================== */}
            {tab === "all" && (
              <>
                {loading && (
                  <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-secondary mx-auto"></div>
                      <p className="mt-4 text-accent6">Loading investment opportunities...</p>
                    </div>
                  </div>
                )}

                {!loading && filteredProjects.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-xl shadow">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg
                        className="w-12 h-12 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-semibold text-accent6 mb-3">
                      No matching projects found
                    </h3>
                    <p className="text-accent6 max-w-md mx-auto mb-6">
                      Try adjusting your filter criteria or search term to find investment opportunities
                    </p>
                    <button
                      onClick={() =>
                        setFilters({
                          category: "",
                          location: "",
                          minROI: 0,
                          maxROI: 50,
                          search: "",
                          sortBy: "roi_desc",
                          riskLevel: "",
                          investmentType: "all",
                        })
                      }
                      className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-accent2 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}

                {/* Projects Grid */}
                {!loading && filteredProjects.length > 0 && (
                  <>
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-accent6">
                        Available Projects ({filteredProjects.length})
                      </h3>
                      <p className="text-accent6">
                        Invest in coconut industry projects and earn returns
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {filteredProjects.map((project) => {
                        const progress =
                          (project.currentAmount / project.targetAmount) * 100;
                        const fundingNeeded =
                          project.targetAmount - project.currentAmount;
                        const isEquityProject =
                          project.investmentType === "equity" &&
                          project.investmentStructure === "units";
                        const ownershipPerShare = project.totalUnits
                          ? (100 / project.totalUnits).toFixed(4)
                          : 0;

                        return (
                          <div
                            key={project.id}
                            className="bg-white rounded-xl shadow-lg overflow-hidden border border-accent5 hover:shadow-xl transition-all duration-300"
                          >
                            {/* Status Badge */}
                            <div className="absolute top-4 right-4 z-10">
                              <span
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                                  project.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : project.status === "funded"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-accent4 text-accent6"
                                }`}
                              >
                                {project.status === "active" ? "Funding" : "Funded"}
                              </span>
                            </div>

                            {/* Project Image/Placeholder */}
                            <div className="h-48 bg-gradient-to-r from-primary/10 to-secondary/10 relative overflow-hidden">
                              {project.imageUrl ? (
                                <img
                                  src={project.imageUrl}
                                  alt={project.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-primary/40">
                                  <svg
                                    className="w-20 h-20 mb-2"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <span className="text-sm text-accent6">Coconut Project</span>
                                </div>
                              )}

                              {/* Category Tag */}
                              <div className="absolute bottom-4 left-4">
                                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-primary text-sm font-semibold rounded-lg">
                                  {project.category}
                                </span>
                              </div>
                            </div>

                            {/* Project Content */}
                            <div className="p-6">
                              {/* Location */}
                              <div className="flex items-center text-accent6 text-sm mb-3">
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {project.location}
                              </div>

                              {/* Title */}
                              <h3 className="text-xl font-bold text-accent6 mb-3 line-clamp-1">
                                {project.title}
                              </h3>

                              {/* Description */}
                              <p className="text-accent6 text-sm mb-4 line-clamp-2">
                                {project.description}
                              </p>

                              {/* Tags */}
                              <div className="flex flex-wrap gap-2 mb-5">
                                {project.tags &&
                                  project.tags.map((tag, index) => (
                                    <span
                                      key={index}
                                      className="px-2.5 py-1 bg-accent5 text-accent6 text-xs rounded-full"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                {isEquityProject && (
                                  <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-semibold">
                                    Share Investment
                                  </span>
                                )}
                              </div>

                              {/* Farmer Info */}
                              <div className="flex items-center gap-3 mb-6 p-3 bg-accent4 rounded-lg">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                  <span className="text-primary font-bold text-lg">
                                    {project.farmerName ? project.farmerName.charAt(0) : "F"}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-accent6">{project.farmerName}</p>
                                  <div className="flex items-center gap-2 text-sm text-accent6">
                                    <span>{project.farmerExperience} years experience</span>
                                    <span>•</span>
                                    <div className="flex items-center">
                                      <svg
                                        className="w-4 h-4 text-yellow-500 mr-1"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                      {project.farmerRating}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Investment Progress */}
                              <div className="mb-6">
                                <div className="flex justify-between text-sm mb-2">
                                  <span className="text-accent6">
                                    Raised:{" "}
                                    <span className="font-bold text-primary">
                                      {formatCurrency(project.currentAmount)}
                                    </span>
                                  </span>
                                  <span className="text-accent6">
                                    Target:{" "}
                                    <span className="font-bold text-accent6">
                                      {formatCurrency(project.targetAmount)}
                                    </span>
                                  </span>
                                </div>
                                <div className="w-full bg-accent3 rounded-full h-3">
                                  <div
                                    className="bg-secondary h-3 rounded-full transition-all duration-700"
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                  ></div>
                                </div>
                                <div className="flex justify-between text-xs text-accent6 mt-2">
                                  <span>{Math.round(progress)}% funded</span>
                                  <span className="font-semibold text-accent1">
                                    Remaining: {formatCurrency(fundingNeeded)}
                                  </span>
                                </div>
                              </div>

                              {/* Show units info for equity investments */}
                              {isEquityProject && (
                                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <div className="text-sm text-accent6 mb-1">Total Shares:</div>
                                      <div className="font-bold text-accent6">
                                        {project.totalUnits.toLocaleString()}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-sm text-accent6 mb-1">Price Per Share:</div>
                                      <div className="font-bold text-accent1">
                                        {formatCurrency(project.unitPrice)}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-sm text-accent6 mb-1">Available Shares:</div>
                                      <div className="font-bold text-primary">
                                        {project.availableUnits.toLocaleString()}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-sm text-accent6 mb-1">Ownership per Share:</div>
                                      <div className="font-bold text-accent1">
                                        {ownershipPerShare}%
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* ROI and Duration */}
                              <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="text-center p-3 bg-gradient-to-br from-accent4 to-white rounded-lg border border-accent5">
                                  <p className="text-2xl font-bold text-accent1">{project.roi}%</p>
                                  <p className="text-xs text-accent6">Expected ROI</p>
                                </div>
                                <div className="text-center p-3 bg-gradient-to-br from-accent4 to-white rounded-lg border border-accent5">
                                  <p className="text-2xl font-bold text-primary">{project.duration}</p>
                                  <p className="text-xs text-accent6">Months Duration</p>
                                </div>
                              </div>

                              {/* Investment Button */}
                              <button
                                onClick={() => handleInvest(project)}
                                disabled={project.status !== "active"}
                                className={`w-full py-3.5 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                                  project.status === "active"
                                    ? "bg-primary hover:bg-accent2 text-white shadow-md hover:shadow-lg"
                                    : "bg-accent4 text-accent3 cursor-not-allowed"
                                }`}
                              >
                                {project.status === "active" ? (
                                  <>
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
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    {isEquityProject ? "Buy Shares" : "Invest Now"}
                                    <span className="ml-auto text-sm font-normal">
                                      {isEquityProject
                                        ? `From ${formatCurrency(project.unitPrice)}/share`
                                        : `Min: ${
                                            fundingNeeded > 100
                                              ? formatCurrency(100)
                                              : formatCurrency(fundingNeeded)
                                          }`}
                                    </span>
                                  </>
                                ) : (
                                  "Fully Funded"
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            )}

            {/* =========================
                TAB: MY INVESTMENTS
            ========================== */}
            {tab === "mine" && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-accent5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="text-2xl font-bold text-accent6">My Investments</h3>
                  <button
                    onClick={fetchMyInvestments}
                    className="px-4 py-2 rounded-lg bg-accent4 text-accent6 hover:bg-accent5"
                  >
                    Refresh
                  </button>
                </div>

                {loadingMine && <p className="text-accent6">Loading your investments...</p>}

                {!loadingMine && myInvestments.length === 0 && (
                  <p className="text-accent6">You haven't invested in any projects yet.</p>
                )}

                {!loadingMine && myInvestments.length > 0 && (
                  <div className="space-y-4">
                    {myInvestments.map((inv) => (
                      <div
                        key={inv.id}
                        className="border border-accent5 rounded-lg p-4 flex flex-col md:flex-row md:justify-between md:items-start gap-3"
                      >
                        <div>
                          <p className="font-bold text-lg text-accent6">
                            {inv.project?.title || inv.project_title || "Project"}
                          </p>
                          <p className="text-sm text-accent6">
                            Location: {inv.project?.location || inv.project_location || "-"}
                          </p>
                          <p className="text-sm text-accent6">Date: {inv.created_at}</p>
                          <p className="text-sm text-accent6">
                            Tx: <span className="font-mono">{inv.transaction_id || "N/A"}</span>
                          </p>
                          {inv.units && inv.total_units && (
                            <div className="mt-2">
                              <p className="text-sm text-accent6">
                                Shares:{" "}
                                <span className="font-semibold text-accent6">
                                  {inv.units.toLocaleString()}
                                </span>
                                {inv.unit_price && (
                                  <span className="text-xs text-accent3">
                                    {" "}
                                    @ {formatCurrency(inv.unit_price)}/share
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-accent6">
                                Ownership:{" "}
                                <span className="font-semibold text-accent1">
                                  {((inv.units / inv.total_units) * 100).toFixed(2)}%
                                </span>
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="md:text-right">
                          <p className="font-bold text-accent6">{formatCurrency(inv.amount)}</p>
                          <p className="text-sm text-accent6">
                            Status:{" "}
                            <span className="font-semibold text-accent6">{inv.status}</span>
                          </p>
                          <p className="text-sm text-accent6">
                            Payment:{" "}
                            <span className="font-semibold text-accent6">
                              {inv.payment_status || "-"}
                            </span>
                          </p>
                          {inv.investment_type === "unit_purchase" && (
                            <p className="text-sm text-accent1 font-semibold">Share Investment</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Investment Guide */}
        <div className="mt-12 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8 border border-accent5">
          <h3 className="text-3xl font-bold text-accent6 mb-2 text-center">How Investing Works</h3>
          <p className="text-accent6 text-center mb-8 max-w-2xl mx-auto">
            Transparent, secure investment process powered by blockchain smart contracts
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-accent5">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h4 className="text-xl font-semibold text-accent6 mb-3">Browse & Select</h4>
              <p className="text-accent6">
                Explore verified coconut industry projects. Review details, ROI projections, and farmer profiles.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-accent5">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h4 className="text-xl font-semibold text-accent6 mb-3">Invest Securely</h4>
              <p className="text-accent6">
                Choose your investment amount or buy shares. Pay securely via PayHere or Stripe. Get instant confirmation.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-accent5">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h4 className="text-xl font-semibold text-accent6 mb-3">Track & Earn</h4>
              <p className="text-accent6">
                Monitor project progress. Receive transparent profit sharing via smart contracts. Support grows.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Create Project Button */}
      <button
        onClick={() => setShowCreatePanel(true)}
        className="fixed bottom-8 right-8 z-40 w-16 h-16 bg-gradient-to-r from-secondary to-accent1 text-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-3xl hover:scale-110 transition-all duration-300 group"
        aria-label="Create new project"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
        </svg>

        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-accent6 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Create New Project
        </div>
      </button>

      {/* Mobile Create Project Button */}
      <button
        onClick={() => setShowCreatePanel(true)}
        className="md:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-gradient-to-r from-secondary to-accent1 text-white px-6 py-3 rounded-full shadow-2xl flex items-center justify-center gap-2 hover:shadow-3xl transition-all duration-300"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="font-semibold">Create Project</span>
      </button>

      <CreateInvestmentModal
        showCreatePanel={showCreatePanel}
        setShowCreatePanel={setShowCreatePanel}
        creatingProject={creatingProject}
        newProject={newProject}
        setNewProject={setNewProject}
        handleCreateProject={handleCreateProject}
        locations={locations}
        formatCurrency={formatCurrency}
      />

      {/* Investment Modal */}
      {isModalOpen && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-accent6">Confirm Investment</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-accent3 hover:text-accent6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6 p-4 bg-accent4 rounded-xl border border-accent5">
                <h4 className="font-bold text-lg text-accent6 mb-2">{selectedProject.title}</h4>
                <div className="flex items-center text-sm text-accent6 mb-2">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {selectedProject.location}
                </div>
                <div className="text-sm text-accent6">
                  Farmer: <span className="font-semibold text-accent6">{selectedProject.farmerName}</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {selectedProject.investmentType === "equity" && selectedProject.investmentStructure === "units" && (
                  <div className="flex gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setGroupInvestmentMode(false)}
                      className={`flex-1 py-2 text-sm rounded-lg border ${
                        !groupInvestmentMode
                          ? "bg-primary text-white border-primary"
                          : "border-accent3 text-accent6 hover:bg-accent4"
                      }`}
                    >
                      Fixed Amount
                    </button>
                    <button
                      type="button"
                      onClick={() => setGroupInvestmentMode(true)}
                      className={`flex-1 py-2 text-sm rounded-lg border ${
                        groupInvestmentMode
                          ? "bg-primary text-white border-primary"
                          : "border-accent3 text-accent6 hover:bg-accent4"
                      }`}
                    >
                      Buy Shares
                    </button>
                  </div>
                )}

                {groupInvestmentMode ? (
                  <div>
                    <label className="block text-sm font-medium text-accent6 mb-2">
                      Purchase Shares
                    </label>
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-accent6">Share Price:</div>
                          <div className="font-bold text-accent6">{formatCurrency(unitPrice)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-accent6">Available Shares:</div>
                          <div className="font-bold text-accent1">{availableUnits.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-accent6">Total Shares:</div>
                          <div className="font-bold text-accent6">{totalUnits.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-accent6">Ownership/Share:</div>
                          <div className="font-bold text-accent1">
                            {totalUnits ? (100 / totalUnits).toFixed(4) : 0}%
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const newUnits = Math.max(1, unitsToPurchase - 1);
                          setUnitsToPurchase(newUnits);
                          updateAmountFromUnits(newUnits);
                        }}
                        className="w-10 h-10 rounded-full border border-accent3 flex items-center justify-center hover:bg-accent4 text-accent6"
                      >
                        -
                      </button>

                      <div className="flex-1">
                        <div className="text-center mb-2">
                          <span className="text-2xl font-bold text-accent6">{unitsToPurchase.toLocaleString()}</span>
                          <span className="text-accent6 ml-2">shares</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max={availableUnits}
                          value={unitsToPurchase}
                          onChange={(e) => {
                            const newUnits = parseInt(e.target.value);
                            setUnitsToPurchase(newUnits);
                            updateAmountFromUnits(newUnits);
                          }}
                          className="w-full h-2 bg-accent3 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const newUnits = Math.min(availableUnits, unitsToPurchase + 1);
                          setUnitsToPurchase(newUnits);
                          updateAmountFromUnits(newUnits);
                        }}
                        className="w-10 h-10 rounded-full border border-accent3 flex items-center justify-center hover:bg-accent4 text-accent6"
                      >
                        +
                      </button>
                    </div>

                    <div className="mt-4 text-center">
                      <div className="text-sm text-accent6 mb-1">Total Investment:</div>
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(unitsToPurchase * unitPrice)}
                      </div>
                      <div className="text-sm text-accent1 mt-1">
                        Ownership: {((unitsToPurchase / totalUnits) * 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-accent6 mb-2">
                        Investment Amount (RS.)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent3">
                          RS.
                        </span>
                        <input
                          type="number"
                          min="100"
                          max={selectedProject.targetAmount - selectedProject.currentAmount}
                          value={investmentAmount}
                          onChange={(e) => {
                            const amount = parseInt(e.target.value) || 0;
                            setInvestmentAmount(amount);
                            if (groupInvestmentMode) updateUnitsFromAmount(amount);
                          }}
                          className="w-full pl-10 pr-4 py-3 border border-accent3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary text-accent6"
                        />
                      </div>
                      <p className="text-xs text-accent3 mt-1">
                        Minimum: RS.100 • Maximum:{" "}
                        {formatCurrency(selectedProject.targetAmount - selectedProject.currentAmount)}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[100, 500, 1000, 2500, 5000, 10000].map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => {
                            setInvestmentAmount(amount);
                            if (groupInvestmentMode) updateUnitsFromAmount(amount);
                          }}
                          className={`py-2 text-sm rounded-lg border ${
                            investmentAmount === amount
                              ? "bg-primary text-white border-primary"
                              : "border-accent3 text-accent6 hover:bg-accent4"
                          }`}
                        >
                          {formatCurrency(amount)}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="bg-accent4 rounded-xl p-4 mb-6 border border-accent5">
                <h4 className="font-bold text-accent6 mb-3">Investment Summary</h4>
                <div className="space-y-2">
                  {groupInvestmentMode ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-accent6">Shares Purchased:</span>
                        <span className="font-semibold text-accent6">{unitsToPurchase.toLocaleString()} shares</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-accent6">Price Per Share:</span>
                        <span className="font-semibold text-accent6">{formatCurrency(unitPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-accent6">Total Investment:</span>
                        <span className="font-semibold text-accent6">{formatCurrency(unitsToPurchase * unitPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-accent6">Ownership Percentage:</span>
                        <span className="font-semibold text-accent1">
                          {((unitsToPurchase / totalUnits) * 100).toFixed(2)}%
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-accent6">Investment Amount:</span>
                      <span className="font-semibold text-accent6">{formatCurrency(investmentAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-accent6">Expected ROI:</span>
                    <span className="font-semibold text-accent1">{selectedProject.roi}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-accent6">Investment Period:</span>
                    <span className="font-semibold text-accent6">{selectedProject.duration} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-accent6">Projected Return:</span>
                    <span className="font-semibold text-accent1">
                      {formatCurrency(
                        calculateExpectedReturn(
                          groupInvestmentMode ? unitsToPurchase * unitPrice : investmentAmount,
                          selectedProject.roi,
                          selectedProject.duration
                        )
                      )}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-accent5 mt-2">
                    <div className="flex justify-between font-bold">
                      <span className="text-accent6">Total Profit:</span>
                      <span className="text-primary">
                        {formatCurrency(
                          parseFloat(
                            calculateExpectedReturn(
                              groupInvestmentMode ? unitsToPurchase * unitPrice : investmentAmount,
                              selectedProject.roi,
                              selectedProject.duration
                            )
                          ) - (groupInvestmentMode ? unitsToPurchase * unitPrice : investmentAmount)
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-accent6 mb-3">
                  Payment Method
                </label>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-accent3 rounded-lg cursor-pointer hover:bg-accent4">
                    <input type="radio" name="paymentMethod" value="payhere" defaultChecked className="mr-3 text-secondary" />
                    <div className="flex-1">
                      <span className="font-medium text-accent6">PayHere</span>
                      <p className="text-sm text-accent6">Secure Sri Lankan payment gateway</p>
                    </div>
                    <div className="w-12 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-800">PH</span>
                    </div>
                  </label>

                  <label className="flex items-center p-3 border border-accent3 rounded-lg cursor-pointer hover:bg-accent4">
                    <input type="radio" name="paymentMethod" value="stripe" className="mr-3 text-secondary" />
                    <div className="flex-1">
                      <span className="font-medium text-accent6">Credit/Debit Card</span>
                      <p className="text-sm text-accent6">Visa, MasterCard, Amex via Stripe</p>
                    </div>
                    <div className="w-12 h-8 bg-purple-100 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-purple-800">CC</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-start">
                  <input type="checkbox" className="mt-1 mr-3 text-secondary" defaultChecked />
                  <span className="text-sm text-accent6">
                    I agree to the Terms & Conditions and understand that this investment involves risks. Returns are projected and not guaranteed.
                    {groupInvestmentMode && " Profit distribution will be proportional to share ownership."}
                  </span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 border border-accent3 text-accent6 rounded-lg hover:bg-accent4 transition-colors font-medium"
                >
                  Cancel
                </button>

                <button
                  onClick={handleConfirmInvestment}
                  className="flex-1 py-3 px-4 bg-primary text-white rounded-lg hover:bg-accent2 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Confirm Investment
                </button>
              </div>

              <p className="text-xs text-accent3 text-center mt-4">
                <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Secured by blockchain smart contracts • SSL encrypted
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ✅ React (Vite) does NOT support <style jsx>. Remove jsx attribute */}
      <style>{`
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
    </div>
  );
};

export default InvestmentPage;
