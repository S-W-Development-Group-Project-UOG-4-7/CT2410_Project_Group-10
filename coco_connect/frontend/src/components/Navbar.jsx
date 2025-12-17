// src/components/Navbar.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import { debounce } from "lodash";

const Navbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  const searchInputRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // ✅ Enhanced user state with localStorage synchronization
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  });

  // ✅ Navigation items for DRY principle
  const navItems = [
    { path: "/", label: "Home", icon: "fa-home" },
    { path: "/about", label: "About Us", icon: "fa-info-circle" },
    { path: "/shop", label: "Shop", icon: "fa-shopping-cart" },
    { path: "/ideas", label: "Idea Sharing", icon: "fa-lightbulb" },
    { path: "/news", label: "News Corner", icon: "fa-newspaper" },
  ];

  // ✅ Language options
  const languages = [
    { code: "en", name: "English", icon: "fa-earth-americas" },
    { code: "si", name: "සිංහල", icon: "fa-earth-asia" },
    { code: "ja", name: "日本語", icon: "fa-earth-asia" },
  ];

  // ✅ Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !event.target.closest('button[aria-label="Mobile menu"]')) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // ✅ Debounced search handler
  const handleSearch = useCallback(
    debounce((query) => {
      if (query.trim()) {
        navigate(`/search?q=${encodeURIComponent(query)}`);
      }
    }, 500),
    [navigate]
  );

  // ✅ Search input handlers
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    handleSearch(value);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setIsSearchFocused(false);
    }
    if (e.key === "Escape") {
      setIsSearchFocused(false);
    }
  };

  // ✅ Auth handlers
  const handleAuthSuccess = (userObj) => {
    setUser(userObj);
    setIsLoginOpen(false);
    setIsRegisterOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    setUser(null);
    setIsUserMenuOpen(false);
    // Optional: Redirect to home after logout
    navigate("/");
  };

  // ✅ User display name with fallback
  const displayName = user?.name || user?.email?.split("@")[0] || "User";

  // ✅ Toggle handlers
  const toggleMobileMenu = () => setIsMobileOpen((prev) => !prev);
  const toggleUserMenu = () => setIsUserMenuOpen((prev) => !prev);
  const toggleSearchFocus = () => {
    setIsSearchFocused((prev) => !prev);
    if (!isSearchFocused) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  // ✅ Modal open handlers
  const openLoginModal = () => setIsLoginOpen(true);
  const openRegisterModal = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-accent4 shadow-lg backdrop-blur-sm bg-opacity-95"
            : "bg-accent4 shadow-md"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-3 lg:py-4">
            {/* Logo Section */}
            <Link to="/" className="flex items-center hover:opacity-90 transition-opacity">
              <img
                src="/tree.png"
                alt="Cococonnect Logo"
                className="w-12 h-12 md:w-14 md:h-14 mr-3"
                loading="lazy"
              />
              <div className="logo-text">
                <span className="coco-text text-2xl md:text-3xl font-bold text-accent1">
                  COCO
                </span>
                <span className="connect-text text-2xl md:text-3xl font-bold text-accent2">
                  CONNECT
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-4 lg:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`font-nunito font-semibold transition-colors px-3 py-2 rounded-md ${
                    location.pathname === item.path
                      ? "text-[#4caf50] bg-accent5 bg-opacity-20"
                      : "text-accent2 hover:text-[#4caf50] hover:bg-accent5 hover:bg-opacity-10"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-3 lg:space-x-4">
              {/* Language Selector */}
              <div className="relative group">
                <button
                  className="flex items-center text-accent2 hover:text-[#4caf50] transition-colors p-2 rounded-full hover:bg-accent5 hover:bg-opacity-10"
                  aria-label="Select language"
                >
                  <i className="fa-solid fa-earth-asia text-lg lg:text-xl" />
                </button>
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl py-2 hidden group-hover:block z-50 border border-accent5">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      className="w-full flex items-center px-4 py-2 text-accent2 hover:bg-accent5 font-nunito font-semibold text-left"
                    >
                      <i className={`fas ${lang.icon} mr-3 text-accent1`} />
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <button
                  onClick={toggleSearchFocus}
                  className="p-2 text-accent2 hover:text-[#4caf50] transition-colors rounded-full hover:bg-accent5 hover:bg-opacity-10"
                  aria-label="Search"
                >
                  <i className="fa-solid fa-magnifying-glass text-lg lg:text-xl" />
                </button>
                
                {/* Expanded Search Input */}
                <div
                  className={`absolute right-0 top-full mt-2 transition-all duration-300 ${
                    isSearchFocused
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  <div className="relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onKeyDown={handleSearchKeyDown}
                      onBlur={() => setIsSearchFocused(false)}
                      placeholder="Search products, ideas..."
                      className="w-64 md:w-80 bg-white text-accent6 border-2 border-accent3 rounded-full px-4 py-2 pr-10 shadow-lg focus:outline-none focus:border-[#4caf50]"
                      aria-label="Search input"
                    />
                    <button
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-accent2 hover:text-[#4caf50]"
                      aria-label="Submit search"
                    >
                      <i className="fa-solid fa-arrow-right" />
                    </button>
                  </div>
                </div>
              </div>

              {/* User Menu */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center gap-2 bg-green-800 hover:bg-green-900 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                    aria-label="User menu"
                    aria-expanded={isUserMenuOpen}
                  >
                    <div className="flex items-center justify-center w-6 h-6 bg-green-700 rounded-full">
                      <i className="fa-regular fa-user text-xs" />
                    </div>
                    <span className="max-w-[120px] truncate">{displayName}</span>
                    <i
                      className={`fas fa-chevron-down text-xs transition-transform ${
                        isUserMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 z-50 bg-white rounded-lg shadow-xl overflow-hidden min-w-[180px] border border-accent5 animate-fadeIn">
                      <div className="px-4 py-3 border-b border-accent5">
                        <p className="font-semibold text-accent6 truncate">{user.email}</p>
                        <p className="text-sm text-accent2 truncate">{displayName}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-3 text-accent6 hover:bg-accent5 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <i className="fas fa-user-circle mr-3 text-accent1" />
                        Profile
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center px-4 py-3 text-accent6 hover:bg-accent5 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <i className="fas fa-shopping-bag mr-3 text-accent1" />
                        My Orders
                      </Link>
                      <div className="border-t border-accent5">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <i className="fas fa-sign-out-alt mr-3" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={openLoginModal}
                  className="flex items-center gap-2 bg-accent2 hover:bg-accent1 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors shadow-md hover:shadow-lg"
                  aria-label="Login"
                >
                  <i className="fa-regular fa-user text-base" />
                  <span className="hidden sm:inline">Login</span>
                </button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden text-accent2 hover:text-[#4caf50] p-2 rounded-lg hover:bg-accent5 hover:bg-opacity-10 transition-colors"
                aria-label="Mobile menu"
                aria-expanded={isMobileOpen}
              >
                <i
                  className={`fas fa-bars text-xl transition-transform ${
                    isMobileOpen ? "rotate-90" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div
            ref={mobileMenuRef}
            className={`md:hidden overflow-hidden transition-all duration-300 ${
              isMobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="py-4 border-t border-accent5 bg-accent4">
              <div className="flex flex-col space-y-3">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? "text-[#4caf50] bg-accent5 bg-opacity-20 font-bold"
                        : "text-accent2 hover:text-[#4caf50] hover:bg-accent5 hover:bg-opacity-10 font-semibold"
                    }`}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <i className={`fas ${item.icon} mr-3 w-5 text-center`} />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onOpenRegister={openRegisterModal}
        onAuthSuccess={handleAuthSuccess}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default Navbar;