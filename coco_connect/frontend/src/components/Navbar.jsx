// src/components/Navbar.jsx
import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import { debounce } from "lodash";

const cx = (...classes) => classes.filter(Boolean).join(" ");

const Navbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState("en");
  const [isSearching, setIsSearching] = useState(false);

  // ✅ NEW: "More" dropdown
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreMenuRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  const searchWrapRef = useRef(null);
  const searchInputRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navbarRef = useRef(null);

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  });

  // Main nav (no icons, no News Corner here)
  const navItems = useMemo(
    () => [
      { path: "/", label: "Home", mobileOnly: false },
      { path: "/about", label: "About Us", mobileOnly: false },
      { path: "/shop", label: "Shop", mobileOnly: false },
      { path: "/investment", label: "Investment", mobileOnly: false },
      { path: "/ideas", label: "Idea Sharing", mobileOnly: false },
      { path: "/contact", label: "Contact", mobileOnly: true },
    ],
    []
  );

  // ✅ "More" items (News Corner goes here)
  const moreItems = useMemo(
    () => [
      { path: "/news", label: "News Corner" },
      // you can add more later: { path: "/events", label: "Events" }
    ],
    []
  );

  const languages = useMemo(
    () => [
      { code: "en", name: "English", icon: "fa-earth-americas" },
      { code: "si", name: "සිංහල", icon: "fa-earth-asia" },
      { code: "ja", name: "日本語", icon: "fa-earth-asia" },
    ],
    []
  );

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setIsUserMenuOpen(false);
      if (isSearchExpanded && searchWrapRef.current && !searchWrapRef.current.contains(event.target))
        setIsSearchExpanded(false);

      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) setIsMoreOpen(false);

      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        const hitMobileBtn = event.target.closest('button[aria-label="Mobile menu"]');
        if (!hitMobileBtn) setIsMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isSearchExpanded]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 10);
        ticking = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setIsSearchExpanded(false);
    setIsUserMenuOpen(false);
    setIsMoreOpen(false);
  }, [location.pathname]);

  const handleSearch = useCallback(
    debounce((query) => {
      if (query.trim()) {
        setIsSearching(true);
        setTimeout(() => {
          navigate(`/search?q=${encodeURIComponent(query)}`);
          setIsSearching(false);
        }, 300);
      }
    }, 500),
    [navigate]
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    handleSearch(value);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setIsSearchExpanded(false);
    }
    if (e.key === "Escape") setIsSearchExpanded(false);
  };

  const handleSearchToggle = () => {
    setIsSearchExpanded((v) => !v);
    setIsUserMenuOpen(false);
    setIsMoreOpen(false);

    if (!isSearchExpanded) {
      setTimeout(() => {
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }, 100);
    }
  };

  const handleAuthSuccess = (userObj) => {
    setUser(userObj);
    setIsLoginOpen(false);
    setIsRegisterOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    setUser(null);
    setIsUserMenuOpen(false);
    navigate("/");
  };

  const displayName = user?.name || user?.email?.split("@")[0] || "User";

  const toggleMobileMenu = () => {
    setIsMobileOpen((prev) => !prev);
    if (isSearchExpanded) setIsSearchExpanded(false);
    setIsUserMenuOpen(false);
    setIsMoreOpen(false);
  };

  const openLoginModal = () => {
    setIsLoginOpen(true);
    setIsMobileOpen(false);
  };

  const openRegisterModal = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  const handleLanguageChange = (code) => {
    setActiveLanguage(code);
  };

  return (
    <>
      <header
        ref={navbarRef}
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-accent4/95 backdrop-blur-md" : "bg-accent4"
        }`}
        style={{
          transition: "all 0.3s ease",
          willChange: "transform, backdrop-filter, background-color",
          borderBottom: "1px solid rgba(76, 175, 80, 0.10)",
          boxShadow: isScrolled ? "0 10px 30px rgba(0,0,0,0.08)" : "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-3 lg:py-4">
            {/* ✅ Logo UNCHANGED */}
            <Link
              to="/"
              className="flex items-center hover:opacity-90 transition-opacity active:scale-95 min-w-0"
              aria-label="Go to homepage"
            >
              <div className="flex-shrink-0">
                <img
                  src="/tree.png"
                  alt="Cococonnect Logo"
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 mr-2 sm:mr-3 transition-transform hover:scale-105"
                  loading="eager"
                  width="56"
                  height="56"
                />
              </div>
              <div className="logo-text overflow-hidden">
                <span className="coco-text text-xl sm:text-2xl md:text-3xl font-bold text-accent1 whitespace-nowrap">
                  COCO
                </span>
                <span className="connect-text text-xl sm:text-2xl md:text-3xl font-bold text-accent2 whitespace-nowrap">
                  CONNECT
                </span>
              </div>
            </Link>

            {/* Desktop Nav + More dropdown */}
            <nav className="hidden lg:flex flex-1 justify-center mx-4">
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(76, 175, 80, 0.10)",
                }}
              >
                {navItems
                  .filter((item) => !item.mobileOnly)
                  .map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`font-nunito font-semibold transition-all px-4 py-2 rounded-xl whitespace-nowrap ${
                        location.pathname === item.path
                          ? "text-[#4caf50] bg-accent5/20 shadow-sm"
                          : "text-accent2 hover:text-[#4caf50] hover:bg-accent5/10"
                      }`}
                      aria-current={location.pathname === item.path ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  ))}

                {/* ✅ More dropdown */}
                <div className="relative" ref={moreMenuRef}>
                  <button
                    onClick={() => setIsMoreOpen((v) => !v)}
                    className={`font-nunito font-semibold transition-all px-4 py-2 rounded-xl whitespace-nowrap ${
                      moreItems.some((i) => i.path === location.pathname)
                        ? "text-[#4caf50] bg-accent5/20 shadow-sm"
                        : "text-accent2 hover:text-[#4caf50] hover:bg-accent5/10"
                    }`}
                    aria-haspopup="true"
                    aria-expanded={isMoreOpen}
                  >
                    More <i className={`fas fa-chevron-down ml-2 text-xs transition-transform ${isMoreOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isMoreOpen && (
                    <div className="absolute right-0 mt-2 z-50 bg-white rounded-xl shadow-2xl overflow-hidden min-w-[200px] border border-accent5/20 animate-fadeIn">
                      <div className="py-2">
                        {moreItems.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMoreOpen(false)}
                            className={`flex items-center px-4 py-3 text-accent6 hover:bg-accent5/5 transition-colors text-sm ${
                              location.pathname === item.path ? "font-bold text-[#4caf50]" : ""
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-accent1 mr-3 opacity-70" />
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </nav>

            {/* Right Actions (same as your setup, spacing improved) */}
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
              {/* Language */}
              <div className="hidden sm:block relative group">
                <button
                  className="flex items-center text-accent2 hover:text-[#4caf50] transition-all p-2 rounded-full hover:bg-accent5/10 active:scale-95"
                  aria-label="Select language"
                  aria-haspopup="true"
                >
                  <i className="fa-solid fa-earth-asia text-base lg:text-lg" />
                  <span className="ml-1 text-xs font-semibold hidden lg:inline">{activeLanguage.toUpperCase()}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl py-2 hidden group-hover:block z-50 border border-accent5/20 animate-fadeIn">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full flex items-center px-4 py-3 text-sm transition-colors ${
                        activeLanguage === lang.code
                          ? "bg-accent5/10 text-[#4caf50] font-bold"
                          : "text-accent6 hover:bg-accent5/5"
                      }`}
                    >
                      <i className={`fas ${lang.icon} mr-3 text-accent1`} />
                      <span className="flex-1 text-left">{lang.name}</span>
                      {activeLanguage === lang.code && <i className="fas fa-check text-[#4caf50] ml-2" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search */}
              <div className="relative" ref={searchWrapRef}>
                <button
                  onClick={handleSearchToggle}
                  className={`p-2 rounded-full transition-all active:scale-95 ${
                    isSearchExpanded
                      ? "text-[#4caf50] bg-accent5/10"
                      : "text-accent2 hover:text-[#4caf50] hover:bg-accent5/10"
                  }`}
                  aria-label="Search"
                  aria-expanded={isSearchExpanded}
                >
                  <i className={`fa-solid ${isSearching ? "fa-spinner fa-spin" : "fa-magnifying-glass"} text-base lg:text-lg`} />
                </button>

                <div
                  className={`absolute right-0 top-full mt-2 transition-all duration-300 ease-out ${
                    isSearchExpanded ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-2 invisible"
                  }`}
                  style={{ zIndex: 100 }}
                >
                  <div className="relative">
                    <div className="bg-white rounded-2xl shadow-2xl p-1 border border-accent5/20">
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onKeyDown={handleSearchKeyDown}
                        onBlur={() => !searchQuery && setIsSearchExpanded(false)}
                        placeholder="Search products, ideas..."
                        className="w-full min-w-[280px] sm:w-64 md:w-72 lg:w-80 bg-transparent text-accent6 px-4 py-3 focus:outline-none"
                        aria-label="Search input"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="text-accent3 hover:text-accent2 transition-colors p-1"
                            aria-label="Clear search"
                          >
                            <i className="fas fa-times text-sm" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (searchQuery.trim()) {
                              navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                              setIsSearchExpanded(false);
                            }
                          }}
                          className="text-accent2 hover:text-[#4caf50] transition-colors p-1"
                          aria-label="Submit search"
                        >
                          <i className="fa-solid fa-arrow-right" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* User */}
              <div className="relative" ref={userMenuRef}>
                {user ? (
                  <>
                    <button
                      onClick={() => setIsUserMenuOpen((prev) => !prev)}
                      className="flex items-center gap-2 bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white px-3 sm:px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 min-w-0"
                      aria-label="User menu"
                      aria-expanded={isUserMenuOpen}
                    >
                      <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-green-600 rounded-full flex-shrink-0">
                        <i className="fa-regular fa-user text-xs" />
                      </div>
                      <span className="max-w-[80px] sm:max-w-[100px] truncate hidden sm:inline">{displayName}</span>
                      <i className={`fas fa-chevron-down text-xs transition-transform flex-shrink-0 ${isUserMenuOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 z-50 bg-white rounded-xl shadow-2xl overflow-hidden min-w-[220px] border border-accent5/20 animate-fadeIn">
                        {/*<div className="px-4 py-3 border-b border-accent5/20 bg-gradient-to-r from-accent5/5 to-transparent">
                          <p className="font-bold text-accent6 truncate text-sm">{displayName}</p>
                          <p className="text-xs text-accent3 truncate mt-1">{user.email}</p>
                        </div>*/}
                        <div className="py-2">
                          <Link to="/customer/profile" className="flex items-center px-4 py-3 text-accent6 hover:bg-accent5/5 transition-colors text-sm" onClick={() => setIsUserMenuOpen(false)}>
                            <span className="w-2 h-2 rounded-full bg-accent1 mr-3 opacity-70" />
                            Profile
                          </Link>
                          {/*<Link to="/customer/orders" className="flex items-center px-4 py-3 text-accent6 hover:bg-accent5/5 transition-colors text-sm" onClick={() => setIsUserMenuOpen(false)}>
                            <span className="w-2 h-2 rounded-full bg-accent1 mr-3 opacity-70" />
                            My Orders
                          </Link>
                          <Link to="/customer/settings" className="flex items-center px-4 py-3 text-accent6 hover:bg-accent5/5 transition-colors text-sm" onClick={() => setIsUserMenuOpen(false)}>
                            <span className="w-2 h-2 rounded-full bg-accent1 mr-3 opacity-70" />
                            Settings
                          </Link>*/}
                        </div>
                        <div className="border-t border-accent5/20 pt-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-sm font-semibold"
                          >
                            <i className="fas fa-sign-out-alt mr-3 w-4 text-center" />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    onClick={openLoginModal}
                    className="flex items-center gap-2 bg-gradient-to-r from-accent2 to-accent1 hover:from-accent1 hover:to-accent2 text-white px-3 sm:px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                    aria-label="Login"
                  >
                    <i className="fa-regular fa-user text-sm" />
                    <span className="hidden sm:inline">Login</span>
                  </button>
                )}
              </div>

              {/* Mobile menu */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden text-accent2 hover:text-[#4caf50] p-2 rounded-lg hover:bg-accent5/10 transition-all active:scale-95 ml-1"
                aria-label="Mobile menu"
                aria-expanded={isMobileOpen}
              >
                <i className={`fas ${isMobileOpen ? "fa-times" : "fa-bars"} text-xl transition-transform duration-300`} />
              </button>
            </div>
          </div>

          {/* Mobile overlay + drawer (News Corner appears as its own tile inside) */}
          <div className={cx("lg:hidden", isMobileOpen ? "block" : "hidden")}>
            <button
              aria-label="Close mobile menu"
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-[2px]"
              style={{ zIndex: 35 }}
            />
            <div
              ref={mobileMenuRef}
              className="fixed right-0 top-[73px] sm:top-[81px] w-[86%] max-w-sm h-[calc(100vh-73px)] sm:h-[calc(100vh-81px)] bg-accent4 shadow-2xl border-l border-accent5/20"
              style={{ zIndex: 40 }}
            >
              <div className="h-full overflow-y-auto pb-10">
                <div className="px-4 py-6">
                  {user ? (
                    <div className="mb-6 p-4 bg-gradient-to-r from-accent5/10 to-transparent rounded-xl border border-accent5/20">
                      <p className="font-bold text-accent6 truncate">{displayName}</p>
                      <p className="text-sm text-accent3 truncate">{user.email}</p>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <button
                        onClick={openLoginModal}
                        className="w-full bg-gradient-to-r from-accent2 to-accent1 text-white py-3 rounded-xl font-bold text-lg shadow-lg active:scale-[0.98] transition-all"
                      >
                        Sign In / Register
                      </button>
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center px-4 py-4 rounded-xl transition-all active:scale-[0.98] ${
                          location.pathname === item.path
                            ? "bg-gradient-to-r from-[#4caf50]/20 to-accent5/10 text-[#4caf50] font-bold border-l-4 border-[#4caf50]"
                            : "text-accent6 hover:bg-accent5/5 hover:text-[#4caf50]"
                        }`}
                        onClick={() => setIsMobileOpen(false)}
                      >
                        <span className="text-lg">{item.label}</span>
                      </Link>
                    ))}

                    <Link
                      to="/news"
                      className={`flex items-center px-4 py-4 rounded-xl transition-all active:scale-[0.98] border border-accent5/20 ${
                        location.pathname === "/news"
                          ? "bg-gradient-to-r from-[#4caf50]/20 to-accent5/10 text-[#4caf50] font-bold"
                          : "text-accent6 hover:bg-accent5/5 hover:text-[#4caf50]"
                      }`}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <span className="text-lg">News Corner</span>
                      <span className="ml-auto text-xs font-semibold text-accent3">NEW</span>
                    </Link>
                  </div>

                  <div className="px-1 mb-6">
                    <h3 className="text-accent3 text-sm font-semibold uppercase mb-3">Language</h3>
                    <div className="flex flex-wrap gap-2">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            handleLanguageChange(lang.code);
                            setIsMobileOpen(false);
                          }}
                          className={`flex items-center px-4 py-2 rounded-full transition-all ${
                            activeLanguage === lang.code
                              ? "bg-gradient-to-r from-accent1 to-accent2 text-white shadow-md"
                              : "bg-accent5/10 text-accent6 hover:bg-accent5/20"
                          }`}
                        >
                          <i className={`fas ${lang.icon} mr-2`} />
                          {lang.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="px-1 pt-6 border-t border-accent5/20">
                    <div className="grid grid-cols-2 gap-3">
                      <Link to="/help" className="text-center p-3 bg-accent5/5 rounded-lg text-accent6 hover:text-[#4caf50] transition-colors" onClick={() => setIsMobileOpen(false)}>
                        <p className="text-sm font-semibold">Help Center</p>
                      </Link>
                      <Link to="/faq" className="text-center p-3 bg-accent5/5 rounded-lg text-accent6 hover:text-[#4caf50] transition-colors" onClick={() => setIsMobileOpen(false)}>
                        <p className="text-sm font-semibold">FAQ</p>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* /mobile */}
        </div>
      </header>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onOpenRegister={openRegisterModal}
        onAuthSuccess={handleAuthSuccess}
      />
      <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} onAuthSuccess={handleAuthSuccess} />
    </>
  );
};

export default Navbar;
