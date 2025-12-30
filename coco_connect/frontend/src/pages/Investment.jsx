// InvestmentPage.jsx
import React, { useState, useEffect } from 'react';

const InvestmentPage = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [investmentAmount, setInvestmentAmount] = useState(100);
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    minROI: 0,
    maxROI: 50,
    search: '',
    sortBy: 'roi_desc',
    riskLevel: '',
    investmentType: 'all'
  });

  // Mock data - Replace with API calls to Django backend
  const mockProjects = [
    {
      id: 1,
      title: 'Organic Coconut Farm Expansion',
      description: 'Expanding organic coconut farm with sustainable practices and modern irrigation in Kurunegala.',
      category: 'Coconut Farming',
      location: 'Kurunegala',
      farmerName: 'Ravi Perera',
      farmerExperience: 12,
      farmerRating: 4.8,
      imageUrl: '',
      roi: 18.5,
      duration: 24,
      targetAmount: 5000000, // RS. 5,000,000
      currentAmount: 3250000, // RS. 3,250,000
      investorsCount: 24,
      status: 'active',
      daysLeft: 45,
      investmentType: 'equity',
      riskLevel: 'medium',
      createdAt: '2024-01-15',
      tags: ['Organic', 'Sustainable', 'Modern Irrigation']
    },
    {
      id: 2,
      title: 'Cold-Press Coconut Oil Production',
      description: 'Establishing cold-press coconut oil production facility with organic certification in Gampaha.',
      category: 'Coconut Oil Production',
      location: 'Gampaha',
      farmerName: 'Samantha Silva',
      farmerExperience: 8,
      farmerRating: 4.6,
      imageUrl: '',
      roi: 22.0,
      duration: 18,
      targetAmount: 7500000, // RS. 7,500,000
      currentAmount: 7500000, // RS. 7,500,000
      investorsCount: 42,
      status: 'funded',
      daysLeft: 0,
      investmentType: 'loan',
      riskLevel: 'low',
      createdAt: '2024-01-10',
      tags: ['Cold-Press', 'Organic Certified', 'Export Quality']
    },
    {
      id: 3,
      title: 'Eco-Friendly Coir Products',
      description: 'Developing innovative coir-based products with eco-friendly packaging for export markets.',
      category: 'Coir Products',
      location: 'Puttalam',
      farmerName: 'Kumar Rajapaksa',
      farmerExperience: 15,
      farmerRating: 4.9,
      imageUrl: '',
      roi: 25.5,
      duration: 12,
      targetAmount: 3000000, // RS. 3,000,000
      currentAmount: 1200000, // RS. 1,200,000
      investorsCount: 8,
      status: 'active',
      daysLeft: 60,
      investmentType: 'equity',
      riskLevel: 'high',
      createdAt: '2024-01-20',
      tags: ['Eco-Friendly', 'Export Market', 'Innovation']
    },
    {
      id: 4,
      title: 'Coconut Shell Activated Charcoal',
      description: 'Producing activated charcoal from coconut shells for water purification systems.',
      category: 'Coconut Shell Products',
      location: 'Matara',
      farmerName: 'Nimal Fernando',
      farmerExperience: 10,
      farmerRating: 4.7,
      imageUrl: '',
      roi: 15.0,
      duration: 36,
      targetAmount: 10000000, // RS. 10,000,000
      currentAmount: 4500000, // RS. 4,500,000
      investorsCount: 35,
      status: 'active',
      daysLeft: 90,
      investmentType: 'equity',
      riskLevel: 'medium',
      createdAt: '2024-01-05',
      tags: ['Activated Charcoal', 'Water Purification', 'Sustainable']
    },
    {
      id: 5,
      title: 'Coconut Husk Organic Fertilizer',
      description: 'Producing organic fertilizer from coconut husk for sustainable agriculture.',
      category: 'Organic Fertilizer',
      location: 'Kandy',
      farmerName: 'Lakshan Perera',
      farmerExperience: 6,
      farmerRating: 4.5,
      imageUrl: '',
      roi: 20.0,
      duration: 15,
      targetAmount: 4000000, // RS. 4,000,000
      currentAmount: 2800000, // RS. 2,800,000
      investorsCount: 18,
      status: 'active',
      daysLeft: 30,
      investmentType: 'equity',
      riskLevel: 'low',
      createdAt: '2024-01-25',
      tags: ['Organic Fertilizer', 'Sustainable', 'Agriculture']
    }
  ];

  const categories = [
    'All Categories',
    'Coconut Farming',
    'Coconut Oil Production',
    'Coir Products',
    'Coconut Shell Products',
    'Organic Fertilizer',
    'Research & Development'
  ];

  const locations = [
    'All Locations',
    'Colombo',
    'Kandy',
    'Gampaha',
    'Kurunegala',
    'Puttalam',
    'Galle',
    'Matara'
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProjects(mockProjects);
      setFilteredProjects(mockProjects);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [projects, filters]);

  const applyFilters = () => {
    let filtered = [...projects];

    // Filter by category
    if (filters.category && filters.category !== 'All Categories') {
      filtered = filtered.filter(project => 
        project.category === filters.category
      );
    }

    // Filter by location
    if (filters.location && filters.location !== 'All Locations') {
      filtered = filtered.filter(project => 
        project.location === filters.location
      );
    }

    // Filter by ROI range
    filtered = filtered.filter(project => 
      project.roi >= filters.minROI && project.roi <= filters.maxROI
    );

    // Filter by risk level
    if (filters.riskLevel) {
      filtered = filtered.filter(project => 
        project.riskLevel === filters.riskLevel
      );
    }

    // Filter by investment type
    if (filters.investmentType !== 'all') {
      filtered = filtered.filter(project => 
        project.investmentType === filters.investmentType
      );
    }

    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(searchTerm) ||
        project.description.toLowerCase().includes(searchTerm) ||
        project.farmerName.toLowerCase().includes(searchTerm)
      );
    }

    // Sort projects
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        switch(filters.sortBy) {
          case 'roi_desc':
            return b.roi - a.roi;
          case 'roi_asc':
            return a.roi - b.roi;
          case 'date_newest':
            return new Date(b.createdAt) - new Date(a.createdAt);
          case 'date_oldest':
            return new Date(a.createdAt) - new Date(b.createdAt);
          case 'funding_needed':
            return (b.targetAmount - b.currentAmount) - (a.targetAmount - a.currentAmount);
          case 'popularity':
            return b.investorsCount - a.investorsCount;
          default:
            return 0;
        }
      });
    }

    setFilteredProjects(filtered);
  };

  const handleInvest = (project) => {
    setSelectedProject(project);
    setInvestmentAmount(project.targetAmount - project.currentAmount > 100 ? 100 : project.targetAmount - project.currentAmount);
    setIsModalOpen(true);
  };

const handleConfirmInvestment = async () => {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/make-investment/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        project_id: selectedProject.id,
        amount: investmentAmount,
        payment_method: "payhere",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    alert(data.message);
  } catch (error) {
    console.error(error);
    alert("Server error");
  }
};


  const calculateExpectedReturn = (amount, roi, duration) => {
    const monthlyROI = roi / 12 / 100;
    const totalMonths = duration;
    const futureValue = amount * Math.pow(1 + monthlyROI, totalMonths);
    return futureValue.toFixed(2);
  };

  // Format currency in Sri Lankan Rupees
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('LKR', 'RS.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent4 to-accent5 font-nunito">
      {/* Header */}
      <div className="bg-primary text-white py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold font-mont mb-2">Investment Opportunities</h1>
          <p className="text-lg opacity-90">
            Invest in Sri Lanka's coconut industry. Support local farmers, earn transparent returns.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-accent5 sticky top-8">
              <h3 className="text-xl font-bold text-accent6 mb-6 pb-3 border-b">Filter Projects</h3>
              
              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-accent3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
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
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                  >
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
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
                      onChange={(e) => setFilters({...filters, minROI: parseInt(e.target.value)})}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={filters.maxROI}
                      onChange={(e) => setFilters({...filters, maxROI: parseInt(e.target.value)})}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Risk Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Risk Level
                  </label>
                  <div className="flex gap-2">
                    {['', 'low', 'medium', 'high'].map((risk) => (
                      <button
                        key={risk || 'all'}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${
                          filters.riskLevel === risk
                            ? risk === 'low' ? 'bg-green-100 text-green-800 border border-green-300' :
                              risk === 'medium' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                              risk === 'high' ? 'bg-red-100 text-red-800 border border-red-300' :
                              'bg-secondary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => setFilters({...filters, riskLevel: risk})}
                      >
                        {risk === '' ? 'All' : risk.charAt(0).toUpperCase() + risk.slice(1)}
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
                        checked={filters.investmentType === 'all'}
                        onChange={(e) => setFilters({...filters, investmentType: e.target.value})}
                        className="mr-2 text-secondary"
                      />
                      <span>All Types</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="investmentType"
                        value="equity"
                        checked={filters.investmentType === 'equity'}
                        onChange={(e) => setFilters({...filters, investmentType: e.target.value})}
                        className="mr-2 text-secondary"
                      />
                      <span>Equity Investment</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="investmentType"
                        value="loan"
                        checked={filters.investmentType === 'loan'}
                        onChange={(e) => setFilters({...filters, investmentType: e.target.value})}
                        className="mr-2 text-secondary"
                      />
                      <span>Loan</span>
                    </label>
                  </div>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={() => setFilters({
                    category: '',
                    location: '',
                    minROI: 0,
                    maxROI: 50,
                    search: '',
                    sortBy: 'roi_desc',
                    riskLevel: '',
                    investmentType: 'all'
                  })}
                  className="w-full py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
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
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Active Investors</span>
                  <span className="font-bold text-coco text-lg">
                    {projects.reduce((sum, p) => sum + p.investorsCount, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Projects Section */}
          <div className="lg:w-3/4">
            {/* Search and Sort Bar */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-accent5">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                {/* Search */}
                <div className="relative w-full md:w-auto md:flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search projects by title, description, or farmer..."
                      className="w-full pl-12 pr-4 py-3 rounded-full border border-accent3 focus:outline-none focus:ring-2 focus:ring-secondary"
                      value={filters.search}
                      onChange={(e) => setFilters({...filters, search: e.target.value})}
                    />
                    <svg className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <span className="text-gray-600 whitespace-nowrap">Sort by:</span>
                  <select 
                    className="px-4 py-2.5 rounded-lg border border-accent3 focus:outline-none focus:ring-2 focus:ring-secondary"
                    value={filters.sortBy}
                    onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                  >
                    <option value="roi_desc">Highest ROI</option>
                    <option value="roi_asc">Lowest ROI</option>
                    <option value="date_newest">Newest First</option>
                    <option value="funding_needed">Most Funding Needed</option>
                    <option value="popularity">Most Popular</option>
                  </select>
                </div>
              </div>
            </div>

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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-700 mb-3">No matching projects found</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  Try adjusting your filter criteria or search term to find investment opportunities
                </p>
                <button
                  onClick={() => setFilters({
                    category: '',
                    location: '',
                    minROI: 0,
                    maxROI: 50,
                    search: '',
                    sortBy: 'roi_desc',
                    riskLevel: '',
                    investmentType: 'all'
                  })}
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
                    
                    return (
                      <div key={project.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-accent5 hover:shadow-xl transition-all duration-300">
                        {/* Status Badge */}
                        <div className="absolute top-4 right-4 z-10">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                            project.status === 'active' ? 'bg-green-100 text-green-800' :
                            project.status === 'funded' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status === 'active' ? 'Funding' : 'Funded'}
                          </span>
                        </div>

                        {/* Project Image/Placeholder */}
                        <div className="h-48 bg-gradient-to-r from-primary/20 to-secondary/20 relative overflow-hidden">
                          {project.imageUrl ? (
                            <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-primary/40">
                              <svg className="w-20 h-20 mb-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
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
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            {project.location}
                          </div>

                          {/* Title */}
                          <h3 className="text-xl font-bold text-accent6 mb-3 line-clamp-1">{project.title}</h3>

                          {/* Description */}
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mb-5">
                            {project.tags.map((tag, index) => (
                              <span key={index} className="px-2.5 py-1 bg-accent5 text-accent2 text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* Farmer Info */}
                          <div className="flex items-center gap-3 mb-6 p-3 bg-accent4 rounded-lg">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-primary font-bold text-lg">
                                {project.farmerName.charAt(0)}
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
                                Goal: <span className="font-bold">{formatCurrency(project.targetAmount)}</span>
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
                              <span>{project.daysLeft} days remaining</span>
                            </div>
                          </div>

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
                            disabled={project.status !== 'active'}
                            className={`w-full py-3.5 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                              project.status === 'active'
                                ? 'bg-primary hover:bg-accent2 text-white shadow-md hover:shadow-lg'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {project.status === 'active' ? (
                              <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Invest Now
                                <span className="ml-auto text-sm font-normal">
                                  Min: {fundingNeeded > 100 ? formatCurrency(100) : formatCurrency(fundingNeeded)}
                                </span>
                              </>
                            ) : (
                              'Fully Funded'
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
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
                Choose your investment amount. Pay securely via PayHere or Stripe. Get instant confirmation.
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

      {/* Investment Modal */}
      {isModalOpen && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-accent6">Confirm Investment</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
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
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {selectedProject.location}
                </div>
                <div className="text-sm text-gray-600">
                  Farmer: <span className="font-semibold">{selectedProject.farmerName}</span>
                </div>
              </div>

              {/* Investment Details */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Investment Amount (RS.)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">RS.</span>
                    <input
                      type="number"
                      min="100"
                      max={selectedProject.targetAmount - selectedProject.currentAmount}
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(parseInt(e.target.value) || 0)}
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
                      onClick={() => setInvestmentAmount(amount)}
                      className={`py-2 text-sm rounded-lg border ${
                        investmentAmount === amount
                          ? 'bg-secondary text-white border-secondary'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {formatCurrency(amount)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Investment Summary */}
              <div className="bg-accent4 rounded-xl p-4 mb-6">
                <h4 className="font-bold text-accent6 mb-3">Investment Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Investment Amount:</span>
                    <span className="font-semibold">{formatCurrency(investmentAmount)}</span>
                  </div>
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
                      {formatCurrency(calculateExpectedReturn(investmentAmount, selectedProject.roi, selectedProject.duration))}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-300 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total Return:</span>
                      <span className="text-primary">
                        {formatCurrency(
                          parseFloat(calculateExpectedReturn(investmentAmount, selectedProject.roi, selectedProject.duration)) -
                          investmentAmount
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Method
                </label>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-accent3 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="payhere"
                      defaultChecked
                      className="mr-3 text-secondary"
                    />
                    <div className="flex-1">
                      <span className="font-medium">PayHere</span>
                      <p className="text-sm text-gray-500">Secure Sri Lankan payment gateway</p>
                    </div>
                    <div className="w-12 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-800">PH</span>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 border border-accent3 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="stripe"
                      className="mr-3 text-secondary"
                    />
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
                  <input
                    type="checkbox"
                    className="mt-1 mr-3 text-secondary"
                    defaultChecked
                  />
                  <span className="text-sm text-gray-600">
                    I agree to the Terms & Conditions and understand that this investment involves risks. 
                    Returns are projected and not guaranteed.
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
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Secured by blockchain smart contracts • SSL encrypted
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentPage;