// InvestmentPage.jsx
import React, { useState, useEffect } from "react";

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
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    category: "Coconut Farming",
    location: "Colombo",
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
    total_units: 1000, // New field for total units/shares
  });

  // Mock data - Fallback if API fails
  const mockProjects = [
    // ... (keep your existing mockProjects array as is)
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
      totalUnits: 5000, // 5000 shares available
      availableUnits: 2500, // 2500 shares remaining
      unitPrice: 1000, // Price per share (targetAmount / totalUnits)
      investmentStructure: "units",
    },
    // ... other projects
  ];

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
    if (!targetAmount || !totalUnits || totalUnits === 0) return 1000; // default
    return Math.round(targetAmount / totalUnits);
  };

  // Calculate per-share ROI (if needed)
  const calculatePerShareROI = (totalROI, totalUnits, unitsOwned) => {
    if (!unitsOwned || unitsOwned === 0) return 0;
    return (totalROI * unitsOwned) / totalUnits;
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

        if (filters.riskLevel) {
          params.append("riskLevel", filters.riskLevel);
        }

        if (filters.investmentType && filters.investmentType !== "all") {
          params.append("investmentType", filters.investmentType);
        }

        if (filters.search) {
          params.append("search", filters.search);
        }

        params.append("sortBy", filters.sortBy);
        params.append("status", "active");

        const response = await fetch(
          `http://127.0.0.1:8000/api/projects/?${params}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }

        const data = await response.json();

        if (data.success && data.projects) {
          const apiProjects = data.projects.map((project) => {
            const targetAmount = parseFloat(project.target_amount) || 0;
            const totalUnits = project.total_units || 1000;
            const unitPrice = project.unit_price || calculateUnitPrice(targetAmount, totalUnits);
            
            return {
              id: project.id,
              title: project.title,
              description: project.description,
              category: project.category,
              location: project.location,
              farmerName: project.farmer_name || "Farmer",
              farmerExperience: project.farmer_experience || 0,
              farmerRating: project.farmer_rating || 4.5,
              imageUrl: "",
              roi: parseFloat(project.roi) || 0,
              duration: project.duration || 12,
              targetAmount: targetAmount,
              currentAmount: parseFloat(project.current_amount) || 0,
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
              totalUnits: totalUnits,
              availableUnits: project.available_units || Math.floor((targetAmount - parseFloat(project.current_amount || 0)) / unitPrice),
              unitPrice: unitPrice,
              investmentStructure: project.investment_structure || (project.investment_type === "equity" ? "units" : "fixed"),
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
      filtered = filtered.filter(
        (project) => project.investmentType === filters.investmentType
      );
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(searchTerm) ||
          project.description.toLowerCase().includes(searchTerm) ||
          project.farmerName.toLowerCase().includes(searchTerm)
      );
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
            return (
              b.targetAmount - b.currentAmount - (a.targetAmount - a.currentAmount)
            );
          case "popularity":
            return b.investorsCount - a.investorsCount;
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
      const res = await fetch("http://127.0.0.1:8000/api/my-investments/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to load investments");
        return;
      }

      setMyInvestments(data.investments || []);
    } catch (e) {
      console.error(e);
      alert("Server error loading investments");
    } finally {
      setLoadingMine(false);
    }
  };

  // Load mine when tab changes
  useEffect(() => {
    if (tab === "mine") {
      fetchMyInvestments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleInvest = (project) => {
    setSelectedProject(project);
    setInvestmentAmount(
      project.targetAmount - project.currentAmount > 100
        ? 100
        : project.targetAmount - project.currentAmount
    );
    
    // Set group investment data if project supports it
    if (project.investmentType === "equity" && project.investmentStructure === "units") {
      setGroupInvestmentMode(true);
      
      // Calculate unit price and available units
      const calculatedUnitPrice = project.unitPrice || calculateUnitPrice(project.targetAmount, project.totalUnits);
      const calculatedAvailableUnits = project.availableUnits || 
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

  const handleConfirmInvestment = async () => {
    try {
      const token = localStorage.getItem("access");

      if (!token) {
        alert("Please login to make an investment");
        return;
      }

      const investmentData = {
        project_id: selectedProject.id,
        payment_method: "payhere",
      };

      // Add data based on investment mode
      if (groupInvestmentMode) {
        const totalInvestmentAmount = unitsToPurchase * unitPrice;
        investmentData.amount = totalInvestmentAmount;
        investmentData.units = unitsToPurchase;
        investmentData.unit_price = unitPrice;
        investmentData.total_units = totalUnits;
        investmentData.investment_type = "unit_purchase";
        investmentData.investment_structure = "units";
        
        // Calculate percentage ownership
        investmentData.ownership_percentage = ((unitsToPurchase / totalUnits) * 100).toFixed(2);
      } else {
        investmentData.amount = investmentAmount;
        investmentData.investment_type = "fixed_amount";
        investmentData.investment_structure = "fixed";
      }

      const res = await fetch("http://127.0.0.1:8000/api/make-investment/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(investmentData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Investment failed");
        return;
      }

      alert(`Investment successful! ${groupInvestmentMode ? `Purchased ${unitsToPurchase} shares (${((unitsToPurchase / totalUnits) * 100).toFixed(2)}% ownership)` : ''}`);
      setIsModalOpen(false);

      // Reset group investment mode
      setGroupInvestmentMode(false);
      setUnitsToPurchase(1);

      // Refresh lists
      if (tab === "all") {
        setFilters((prev) => ({ ...prev })); // triggers fetchProjects via dependency
      } else {
        fetchMyInvestments();
      }
    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };

  // Handle project creation
  const handleCreateProject = async () => {
    try {
      setCreatingProject(true);
      const token = localStorage.getItem("access");

      if (!token) {
        alert("Please login to create a project");
        return;
      }

      const formData = new FormData();
      
      // Append all project data
      Object.keys(newProject).forEach(key => {
        if (newProject[key] !== null && newProject[key] !== undefined) {
          if (key === 'image' || key === 'business_plan' || key === 'additional_docs') {
            if (newProject[key]) {
              formData.append(key, newProject[key]);
            }
          } else {
            formData.append(key, newProject[key]);
          }
        }
      });

      // Calculate unit price for equity projects
      if (newProject.investment_type === "equity" && newProject.target_amount && newProject.total_units) {
        const calculatedUnitPrice = Math.round(newProject.target_amount / newProject.total_units);
        formData.append("unit_price", calculatedUnitPrice);
      }

      const response = await fetch("http://127.0.0.1:8000/api/create-project/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to create project");
        return;
      }

      alert("Project created successfully! It will be reviewed by admin.");
      setShowCreatePanel(false);
      
      // Reset form
      setNewProject({
        title: "",
        description: "",
        category: "Coconut Farming",
        location: "Colombo",
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

      // Refresh projects list
      setFilters(prev => ({ ...prev }));

    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project");
    } finally {
      setCreatingProject(false);
    }
  };

  // Reset form when panel closes
  const handleCloseCreatePanel = () => {
    setShowCreatePanel(false);
    setNewProject({
      title: "",
      description: "",
      category: "Coconut Farming",
      location: "Colombo",
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
                Invest in Sri Lanka's coconut industry. Support local farmers, earn transparent returns.
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
              <h3 className="text-xl font-bold text-accent6 mb-6 pb-3 border-b">
                Filter Projects
              </h3>

              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-accent3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    value={filters.category}
                    onChange={(e) =>
                      setFilters({ ...filters, category: e.target.value })
                    }
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-accent3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    value={filters.location}
                    onChange={(e) =>
                      setFilters({ ...filters, location: e.target.value })
                    }
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
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
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      disabled={tab === "mine"}
                    />
                  </div>
                </div>

                {/* Risk Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                              : "bg-secondary text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      <span>All Types</span>
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
                      <span>Equity (Shares)</span>
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
                      <span>Loan</span>
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
                  className={`w-full py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium ${
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
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Total Projects</span>
                  <span className="font-bold text-primary text-lg">{projects.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Total Investment</span>
                  <span className="font-bold text-secondary text-lg">
                    {formatCurrency(projects.reduce((sum, p) => sum + p.currentAmount, 0))}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Average ROI</span>
                  <span className="font-bold text-green-600 text-lg">
                    {projects.length > 0
                      ? (projects.reduce((sum, p) => sum + p.roi, 0) / projects.length).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Total Shares</span>
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
                {/* Tabs (All Projects | My Investments) */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setTab("all")}
                    className={`px-5 py-2 rounded-full font-semibold ${
                      tab === "all" ? "bg-primary text-white" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    All Projects
                  </button>
                  <button
                    onClick={() => setTab("mine")}
                    className={`px-5 py-2 rounded-full font-semibold ${
                      tab === "mine" ? "bg-primary text-white" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    My Investments
                  </button>
                </div>

                {/* Search + Sort (only meaningful for All Projects) */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  {/* Search */}
                  <div className="relative w-full md:w-auto md:flex-1">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search projects by title, description, or farmer..."
                        className="w-full pl-12 pr-4 py-3 rounded-full border border-accent3 focus:outline-none focus:ring-2 focus:ring-secondary"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        disabled={tab === "mine"}
                      />
                      <svg
                        className="w-5 h-5 absolute left-4 top-3.5 text-gray-400"
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

                  {/* Sort */}
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <span className="text-gray-600 whitespace-nowrap">Sort by:</span>
                    <select
                      className="px-4 py-2.5 rounded-lg border border-accent3 focus:outline-none focus:ring-2 focus:ring-secondary"
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
                {/* Loading State */}
                {loading && (
                  <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-secondary mx-auto"></div>
                      <p className="mt-4 text-gray-600">Loading investment opportunities...</p>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!loading && filteredProjects.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-xl shadow">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-700 mb-3">No matching projects found</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
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
                      <p className="text-gray-600">Invest in coconut industry projects and earn returns</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {filteredProjects.map((project) => {
                        const progress = (project.currentAmount / project.targetAmount) * 100;
                        const fundingNeeded = project.targetAmount - project.currentAmount;
                        const isEquityProject = project.investmentType === "equity" && project.investmentStructure === "units";
                        const ownershipPerShare = project.totalUnits ? (100 / project.totalUnits).toFixed(4) : 0;

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
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {project.status === "active" ? "Funding" : "Funded"}
                              </span>
                            </div>

                            {/* Project Image/Placeholder */}
                            <div className="h-48 bg-gradient-to-r from-primary/20 to-secondary/20 relative overflow-hidden">
                              {project.imageUrl ? (
                                <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-primary/40">
                                  <svg className="w-20 h-20 mb-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                      fillRule="evenodd"
                                      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <span className="text-sm">Coconut Project</span>
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
                              <div className="flex items-center text-gray-500 text-sm mb-3">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {project.location}
                              </div>

                              {/* Title */}
                              <h3 className="text-xl font-bold text-accent6 mb-3 line-clamp-1">{project.title}</h3>

                              {/* Description */}
                              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>

                              {/* Tags */}
                              <div className="flex flex-wrap gap-2 mb-5">
                                {project.tags &&
                                  project.tags.map((tag, index) => (
                                    <span key={index} className="px-2.5 py-1 bg-accent5 text-accent2 text-xs rounded-full">
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
                                  <p className="font-medium text-gray-800">{project.farmerName}</p>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>{project.farmerExperience} years experience</span>
                                    <span>•</span>
                                    <div className="flex items-center">
                                      <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
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
                                  <span className="text-gray-600">
                                    Raised: <span className="font-bold text-primary">{formatCurrency(project.currentAmount)}</span>
                                  </span>
                                  <span className="text-gray-600">
                                    Target: <span className="font-bold">{formatCurrency(project.targetAmount)}</span>
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                  <div
                                    className="bg-secondary h-3 rounded-full transition-all duration-700"
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                  ></div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-2">
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
                                      <div className="text-sm text-gray-600 mb-1">Total Shares:</div>
                                      <div className="font-bold text-gray-800">{project.totalUnits.toLocaleString()}</div>
                                    </div>
                                    <div>
                                      <div className="text-sm text-gray-600 mb-1">Price Per Share:</div>
                                      <div className="font-bold text-green-600">{formatCurrency(project.unitPrice)}</div>
                                    </div>
                                    <div>
                                      <div className="text-sm text-gray-600 mb-1">Available Shares:</div>
                                      <div className="font-bold text-blue-600">{project.availableUnits.toLocaleString()}</div>
                                    </div>
                                    <div>
                                      <div className="text-sm text-gray-600 mb-1">Ownership per Share:</div>
                                      <div className="font-bold text-accent1">{ownershipPerShare}%</div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* ROI and Duration */}
                              <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="text-center p-3 bg-gradient-to-br from-accent4 to-white rounded-lg border border-accent5">
                                  <p className="text-2xl font-bold text-accent1">{project.roi}%</p>
                                  <p className="text-xs text-gray-600">Expected ROI</p>
                                </div>
                                <div className="text-center p-3 bg-gradient-to-br from-accent4 to-white rounded-lg border border-accent5">
                                  <p className="text-2xl font-bold text-primary">{project.duration}</p>
                                  <p className="text-xs text-gray-600">Months Duration</p>
                                </div>
                              </div>

                              {/* Investment Button */}
                              <button
                                onClick={() => handleInvest(project)}
                                disabled={project.status !== "active"}
                                className={`w-full py-3.5 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                                  project.status === "active"
                                    ? "bg-primary hover:bg-accent2 text-white shadow-md hover:shadow-lg"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                }`}
                              >
                                {project.status === "active" ? (
                                  <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    {isEquityProject ? "Buy Shares" : "Invest Now"}
                                    <span className="ml-auto text-sm font-normal">
                                      {isEquityProject ? 
                                        `From ${formatCurrency(project.unitPrice)}/share` : 
                                        `Min: ${fundingNeeded > 100 ? formatCurrency(100) : formatCurrency(fundingNeeded)}`
                                      }
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
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Refresh
                  </button>
                </div>

                {loadingMine && <p className="text-gray-600">Loading your investments...</p>}

                {!loadingMine && myInvestments.length === 0 && (
                  <p className="text-gray-600">You haven't invested in any projects yet.</p>
                )}

                {!loadingMine && myInvestments.length > 0 && (
                  <div className="space-y-4">
                    {myInvestments.map((inv) => (
                      <div key={inv.id} className="border rounded-lg p-4 flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                        <div>
                          <p className="font-bold text-lg">{inv.project?.title || "Project"}</p>
                          <p className="text-sm text-gray-600">Location: {inv.project?.location || "-"}</p>
                          <p className="text-sm text-gray-600">Date: {inv.created_at}</p>
                          <p className="text-sm text-gray-600">
                            Tx: <span className="font-mono">{inv.transaction_id || "N/A"}</span>
                          </p>
                          {inv.units && inv.total_units && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">
                                Shares: <span className="font-semibold">{inv.units.toLocaleString()}</span> 
                                {inv.unit_price && <span className="text-xs text-gray-500"> @ {formatCurrency(inv.unit_price)}/share</span>}
                              </p>
                              <p className="text-sm text-gray-600">
                                Ownership: <span className="font-semibold text-accent1">
                                  {((inv.units / inv.total_units) * 100).toFixed(2)}%
                                </span>
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="md:text-right">
                          <p className="font-bold">{formatCurrency(inv.amount)}</p>
                          <p className="text-sm">
                            Status: <span className="font-semibold">{inv.status}</span>
                          </p>
                          <p className="text-sm">
                            Payment: <span className="font-semibold">{inv.payment_status || "-"}</span>
                          </p>
                          {inv.investment_type === "unit_purchase" && (
                            <p className="text-sm text-green-600 font-semibold">Share Investment</p>
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
          <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
            Transparent, secure investment process powered by blockchain smart contracts
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h4 className="text-xl font-semibold text-accent6 mb-3">Browse & Select</h4>
              <p className="text-gray-600">
                Explore verified coconut industry projects. Review details, ROI projections, and farmer profiles.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h4 className="text-xl font-semibold text-accent6 mb-3">Invest Securely</h4>
              <p className="text-gray-600">
                Choose your investment amount or buy shares. Pay securely via PayHere or Stripe. Get instant confirmation.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h4 className="text-xl font-semibold text-accent6 mb-3">Track & Earn</h4>
              <p className="text-gray-600">
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
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Create New Project
        </div>
      </button>

      {/* Create Project Panel (Centered) */}
      {showCreatePanel && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={handleCloseCreatePanel}
          ></div>
          
          {/* Centered Panel */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
              <div className="p-6">
                {/* Panel Header */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                  <h3 className="text-2xl font-bold text-accent6">Create New Project</h3>
                  <button 
                    onClick={handleCloseCreatePanel}
                    className="text-gray-400 hover:text-gray-600"
                  >
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Project Title *
                        </label>
                        <input
                          type="text"
                          value={newProject.title}
                          onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                          className="w-full px-4 py-3 border border-accent3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                          placeholder="e.g., Organic Coconut Oil Production Unit"
                          required
                        />
                      </div>

                      {/* Project Description */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Project Description *
                        </label>
                        <textarea
                          value={newProject.description}
                          onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                          className="w-full px-4 py-3 border border-accent3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                          rows="4"
                          placeholder="Describe your project in detail..."
                          required
                        />
                      </div>

                      {/* Category and Location */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                          </label>
                          <select
                            value={newProject.category}
                            onChange={(e) => setNewProject({...newProject, category: e.target.value})}
                            className="w-full px-4 py-3 border border-accent3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                          >
                            {categories.filter(cat => cat !== "All Categories").map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location *
                          </label>
                          <select
                            value={newProject.location}
                            onChange={(e) => setNewProject({...newProject, location: e.target.value})}
                            className="w-full px-4 py-3 border border-accent3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                          >
                            {locations.filter(loc => loc !== "All Locations").map(location => (
                              <option key={location} value={location}>{location}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tags (comma separated)
                        </label>
                        <input
                          type="text"
                          value={newProject.tags}
                          onChange={(e) => setNewProject({...newProject, tags: e.target.value})}
                          className="w-full px-4 py-3 border border-accent3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                          placeholder="e.g., Organic, Sustainable, Export"
                        />
                      </div>
                    </div>

                    {/* Farmer Information */}
                    <div>
                      <h4 className="font-bold text-accent6 mb-4 text-lg">Farmer/Entrepreneur Information</h4>
                      <div className="bg-accent4 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Name *
                            </label>
                            <input
                              type="text"
                              value={newProject.farmer_name}
                              onChange={(e) => setNewProject({...newProject, farmer_name: e.target.value})}
                              className="w-full px-4 py-3 border border-accent3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                              placeholder="Your name"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Years of Experience *
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={newProject.farmer_experience}
                              onChange={(e) => setNewProject({...newProject, farmer_experience: e.target.value})}
                              className="w-full px-4 py-3 border border-accent3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expected ROI (%) *
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            step="0.5"
                            value={newProject.roi}
                            onChange={(e) => setNewProject({...newProject, roi: e.target.value})}
                            className="w-full px-4 py-3 border border-accent3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Duration (Months) *
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="60"
                            value={newProject.duration}
                            onChange={(e) => setNewProject({...newProject, duration: e.target.value})}
                            className="w-full px-4 py-3 border border-accent3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Target Amount (LKR) *
                          </label>
                          <input
                            type="number"
                            min="100000"
                            step="10000"
                            value={newProject.target_amount}
                            onChange={(e) => setNewProject({...newProject, target_amount: e.target.value})}
                            className="w-full px-4 py-3 border border-accent3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                            placeholder="e.g., 5000000"
                            required
                          />
                        </div>
                      </div>

                      {/* Total Shares for Equity Projects */}
                      {newProject.investment_type === "equity" && (
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Total Number of Shares *
                          </label>
                          <input
                            type="number"
                            min="100"
                            step="100"
                            value={newProject.total_units}
                            onChange={(e) => setNewProject({...newProject, total_units: e.target.value})}
                            className="w-full px-4 py-3 border border-accent3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                            placeholder="e.g., 1000 shares"
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Price per share will be calculated automatically: {newProject.target_amount && newProject.total_units ? 
                              formatCurrency(Math.round(newProject.target_amount / newProject.total_units)) : '0'} per share
                          </p>
                        </div>
                      )}

                      {/* Investment Type and Risk Level */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Investment Type *
                          </label>
                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="newInvestmentType"
                                value="equity"
                                checked={newProject.investment_type === "equity"}
                                onChange={(e) => setNewProject({...newProject, investment_type: e.target.value})}
                                className="mr-2 text-secondary"
                              />
                              <span>Equity (Share Investment)</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="newInvestmentType"
                                value="loan"
                                checked={newProject.investment_type === "loan"}
                                onChange={(e) => setNewProject({...newProject, investment_type: e.target.value})}
                                className="mr-2 text-secondary"
                              />
                              <span>Loan</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                                onClick={() => setNewProject({...newProject, risk_level: risk})}
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Image (Optional)
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setNewProject({...newProject, image: e.target.files[0]})}
                            className="w-full px-4 py-3 border border-accent3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business Plan (PDF/DOC) (Optional)
                          </label>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => setNewProject({...newProject, business_plan: e.target.files[0]})}
                            className="w-full px-4 py-3 border border-accent3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Additional Documents (Optional)
                          </label>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.png"
                            onChange={(e) => setNewProject({...newProject, additional_docs: e.target.files[0]})}
                            className="w-full px-4 py-3 border border-accent3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
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
                        onClick={handleCloseCreatePanel}
                        className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        disabled={creatingProject}
                      >
                        Cancel
                      </button>

                      <button
                        onClick={handleCreateProject}
                        disabled={creatingProject || !newProject.title || !newProject.description || !newProject.farmer_name || !newProject.target_amount || (newProject.investment_type === "equity" && !newProject.total_units)}
                        className={`flex-1 py-3 px-4 bg-primary text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 ${
                          creatingProject || !newProject.title || !newProject.description || !newProject.farmer_name || !newProject.target_amount || (newProject.investment_type === "equity" && !newProject.total_units)
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
        </>
      )}

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

      {/* Investment Modal */}
      {isModalOpen && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-accent6">Confirm Investment</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Project Info */}
              <div className="mb-6 p-4 bg-accent4 rounded-xl">
                <h4 className="font-bold text-lg text-accent6 mb-2">{selectedProject.title}</h4>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {selectedProject.location}
                </div>
                <div className="text-sm text-gray-600">
                  Farmer: <span className="font-semibold">{selectedProject.farmerName}</span>
                </div>
              </div>

              {/* Investment Details */}
              <div className="space-y-4 mb-6">
                {/* Toggle between normal and group investment */}
                {selectedProject.investmentType === "equity" && selectedProject.investmentStructure === "units" && (
                  <div className="flex gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setGroupInvestmentMode(false)}
                      className={`flex-1 py-2 text-sm rounded-lg border ${
                        !groupInvestmentMode
                          ? "bg-primary text-white border-primary"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
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
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Buy Shares
                    </button>
                  </div>
                )}

                {groupInvestmentMode ? (
                  /* Stock/Unit Investment Mode */
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Purchase Shares
                    </label>
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-gray-600">Share Price:</div>
                          <div className="font-bold">{formatCurrency(unitPrice)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Available Shares:</div>
                          <div className="font-bold text-green-600">{availableUnits.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Total Shares:</div>
                          <div className="font-bold">{totalUnits.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Ownership/Share:</div>
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
                        className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        -
                      </button>
                      
                      <div className="flex-1">
                        <div className="text-center mb-2">
                          <span className="text-2xl font-bold">{unitsToPurchase.toLocaleString()}</span>
                          <span className="text-gray-600 ml-2">shares</span>
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
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          const newUnits = Math.min(availableUnits, unitsToPurchase + 1);
                          setUnitsToPurchase(newUnits);
                          updateAmountFromUnits(newUnits);
                        }}
                        className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="mt-4 text-center">
                      <div className="text-sm text-gray-600 mb-1">Total Investment:</div>
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(unitsToPurchase * unitPrice)}
                      </div>
                      <div className="text-sm text-accent1 mt-1">
                        Ownership: {((unitsToPurchase / totalUnits) * 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Original Fixed Amount Mode */
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Investment Amount (RS.)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">RS.</span>
                        <input
                          type="number"
                          min="100"
                          max={selectedProject.targetAmount - selectedProject.currentAmount}
                          value={investmentAmount}
                          onChange={(e) => {
                            const amount = parseInt(e.target.value) || 0;
                            setInvestmentAmount(amount);
                            if (groupInvestmentMode) {
                              updateUnitsFromAmount(amount);
                            }
                          }}
                          className="w-full pl-10 pr-4 py-3 border border-accent3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Minimum: RS.100 • Maximum: {formatCurrency(selectedProject.targetAmount - selectedProject.currentAmount)}
                      </p>
                    </div>

                    {/* Quick Amount Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      {[100, 500, 1000, 2500, 5000, 10000].map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => {
                            setInvestmentAmount(amount);
                            if (groupInvestmentMode) {
                              updateUnitsFromAmount(amount);
                            }
                          }}
                          className={`py-2 text-sm rounded-lg border ${
                            investmentAmount === amount
                              ? "bg-secondary text-white border-secondary"
                              : "border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {formatCurrency(amount)}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Investment Summary */}
              <div className="bg-accent4 rounded-xl p-4 mb-6">
                <h4 className="font-bold text-accent6 mb-3">Investment Summary</h4>
                <div className="space-y-2">
                  {groupInvestmentMode ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shares Purchased:</span>
                        <span className="font-semibold">{unitsToPurchase.toLocaleString()} shares</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price Per Share:</span>
                        <span className="font-semibold">{formatCurrency(unitPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Investment:</span>
                        <span className="font-semibold">{formatCurrency(unitsToPurchase * unitPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ownership Percentage:</span>
                        <span className="font-semibold text-accent1">
                          {((unitsToPurchase / totalUnits) * 100).toFixed(2)}%
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Investment Amount:</span>
                      <span className="font-semibold">{formatCurrency(investmentAmount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected ROI:</span>
                    <span className="font-semibold text-green-600">{selectedProject.roi}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Investment Period:</span>
                    <span className="font-semibold">{selectedProject.duration} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Projected Return:</span>
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
                  <div className="pt-2 border-t border-gray-300 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total Profit:</span>
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

              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-accent3 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="paymentMethod" value="payhere" defaultChecked className="mr-3 text-secondary" />
                    <div className="flex-1">
                      <span className="font-medium">PayHere</span>
                      <p className="text-sm text-gray-500">Secure Sri Lankan payment gateway</p>
                    </div>
                    <div className="w-12 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-800">PH</span>
                    </div>
                  </label>

                  <label className="flex items-center p-3 border border-accent3 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="paymentMethod" value="stripe" className="mr-3 text-secondary" />
                    <div className="flex-1">
                      <span className="font-medium">Credit/Debit Card</span>
                      <p className="text-sm text-gray-500">Visa, MasterCard, Amex via Stripe</p>
                    </div>
                    <div className="w-12 h-8 bg-purple-100 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-purple-800">CC</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="mb-6">
                <label className="flex items-start">
                  <input type="checkbox" className="mt-1 mr-3 text-secondary" defaultChecked />
                  <span className="text-sm text-gray-600">
                    I agree to the Terms & Conditions and understand that this investment involves risks. Returns are projected and not guaranteed.
                    {groupInvestmentMode && " Profit distribution will be proportional to share ownership."}
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
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

              {/* Security Note */}
              <p className="text-xs text-gray-500 text-center mt-4">
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
    </div>
  );
};

export default InvestmentPage;