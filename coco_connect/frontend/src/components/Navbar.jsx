import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import { debounce } from "lodash";
import { useCart } from "../context/CartContext";


const Navbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  const { cartCount } = useCart();

  const location = useLocation();
  const navigate = useNavigate();

  const userMenuRef = useRef(null);
  const searchInputRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // ================= USER STATE =================
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // ================= NAV DATA =================
  const navItems = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About Us" },
    { path: "/shop", label: "Shop" },
    { path: "/investment", label: "Investment" },
    { path: "/ideas", label: "Idea Sharing" },
    { path: "/news", label: "News Corner" },
  ];

  const languages = ["English", "සිංහල", "日本語"];

  // ================= EFFECTS =================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target) &&
        !e.target.closest('button[aria-label="Mobile menu"]')
      ) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isSearchFocused) {
      searchInputRef.current?.focus();
    }
  }, [isSearchFocused]);

  // ================= SEARCH =================
  const debouncedSearch = useCallback(
    debounce((q) => {
      if (q.trim()) {
        navigate(`/search?q=${encodeURIComponent(q)}`);
      }
    }, 500),
    [navigate]
  );

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  const handleSearchKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsSearchFocused(false);
    }
  };

  // ================= AUTH =================
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
    setIsUserMenuOpen(false);
    navigate("/");
  };

  const displayName = user?.name || user?.email?.split("@")[0] || "User";

  // ================= RENDER =================
  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all ${
          isScrolled ? "bg-accent4 shadow-lg" : "bg-accent4 shadow-md"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img src="/tree.png" alt="Logo" className="w-14 mr-3" />
              <span className="text-3xl font-bold text-accent2">
                COCOCONNECT
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`font-semibold ${
                    location.pathname === item.path
                      ? "text-green-600"
                      : "text-accent2 hover:text-green-600"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Language */}
              <div className="relative group">
                <i className="fa-solid fa-earth-asia text-xl cursor-pointer" />
                <div className="absolute right-0 mt-2 w-36 bg-white shadow rounded hidden group-hover:block">
                  {languages.map((lang) => (
                    <div key={lang} className="px-4 py-2 hover:bg-accent5">
                      {lang}
                    </div>
                  ))}
                </div>
              </div>

              {/* Search */}
              <button onClick={() => setIsSearchFocused(true)}>
                <i className="fa-solid fa-magnifying-glass text-xl" />
              </button>

              {isSearchFocused && (
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    debouncedSearch(e.target.value);
                  }}
                  onKeyDown={handleSearchKeyDown}
                  onBlur={() => setIsSearchFocused(false)}
                  className="border px-3 py-1 rounded"
                  placeholder="Search..."
                />
              )}

              {/* Cart */}
<Link to="/cart" className="relative">
  <i className="fa-solid fa-cart-shopping text-xl" />
  {cartCount > 0 && (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
      {cartCount}
    </span>
  )}
</Link>


              {/* User */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button onClick={() => setIsUserMenuOpen((p) => !p)}>
                    {displayName}
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 bg-white shadow rounded">
                      <Link to="/profile" className="block px-4 py-2">
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-red-500"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={() => setIsLoginOpen(true)}>Login</button>
              )}

              {/* Mobile */}
              <button
                aria-label="Mobile menu"
                onClick={() => setIsMobileOpen((p) => !p)}
                className="md:hidden"
              >
                <i className="fas fa-bars text-xl" />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileOpen && (
            <div ref={mobileMenuRef} className="md:hidden py-4">
              {navItems.map((i) => (
                <Link key={i.path} to={i.path} className="block py-2">
                  {i.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onOpenRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
        onAuthSuccess={setUser}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onAuthSuccess={setUser}
      />
    </>
  );
};

export default Navbar;
