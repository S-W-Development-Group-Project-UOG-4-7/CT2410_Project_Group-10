// src/components/Navbar.jsx
import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { debounce } from "lodash";

import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import { useCart } from "../context/CartContext";

const cx = (...classes) => classes.filter(Boolean).join(" ");

const Navbar = () => {
  const { cartCount } = useCart();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState("en");
  const [isSearching, setIsSearching] = useState(false);

  // More dropdown
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreMenuRef = useRef(null);

  // Logout modal
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const userMenuRef = useRef(null);
  const searchWrapRef = useRef(null);
  const searchInputRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const navItems = useMemo(
    () => [
      { path: "/", label: "Home", mobileOnly: false },
      { path: "/about", label: "About Us", mobileOnly: false },
      { path: "/shop", label: "Shop", mobileOnly: false },
      { path: "/investment", label: "Investment", mobileOnly: false },
      { path: "/ideas", label: "Idea Sharing", mobileOnly: false },
    ],
    []
  );

  const moreItems = useMemo(
    () => [{ path: "/news", label: "News Corner" }],
    []
  );

  const languages = useMemo(
    () => [
      { code: "en", name: "English" },
      { code: "si", name: "සිංහල" },
      { code: "ja", name: "日本語" },
    ],
    []
  );

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
      if (
        isSearchExpanded &&
        searchWrapRef.current &&
        !searchWrapRef.current.contains(e.target)
      ) {
        setIsSearchExpanded(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setIsMoreOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        const hitBtn = e.target.closest('button[aria-label="Mobile menu"]');
        if (!hitBtn) setIsMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearchExpanded]);

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Reset menus on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setIsSearchExpanded(false);
    setIsUserMenuOpen(false);
    setIsMoreOpen(false);
  }, [location.pathname]);

  const handleSearch = useCallback(
    debounce((q) => {
      if (q.trim()) {
        setIsSearching(true);
        setTimeout(() => {
          navigate(`/search?q=${encodeURIComponent(q)}`);
          setIsSearching(false);
        }, 300);
      }
    }, 500),
    [navigate]
  );

  useEffect(() => () => handleSearch.cancel?.(), [handleSearch]);

  const handleAuthSuccess = (userObj) => {
    setUser(userObj);
    setIsLoginOpen(false);
    setIsRegisterOpen(false);
    navigate("/");
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    ["access", "refresh", "user", "role", "name", "email"].forEach((k) =>
      localStorage.removeItem(k)
    );
    setUser(null);
    setShowLogoutModal(false);
    navigate("/");
  };

  const displayName =
    user?.name || user?.email?.split("@")[0] || "User";

  return (
    <>
      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowLogoutModal(false)}
          />
          <div className="relative bg-white rounded-xl p-6 shadow-xl z-10">
            <h3 className="font-bold text-lg mb-2">
              Sign out of CocoConnect?
            </h3>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 rounded bg-red-600 text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <header
        className={`sticky top-0 z-50 ${
          isScrolled ? "bg-accent4/95 backdrop-blur" : "bg-accent4"
        }`}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/tree.png" alt="Logo" className="w-10 h-10" />
            <span className="font-bold text-xl">
              <span className="text-accent1">COCO</span>
              <span className="text-accent2">CONNECT</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded ${
                  location.pathname === item.path
                    ? "text-[#4caf50]"
                    : "text-accent2"
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* More */}
            <div className="relative" ref={moreMenuRef}>
              <button
                onClick={() => setIsMoreOpen((v) => !v)}
                className="px-4 py-2 text-accent2"
              >
                More ▾
              </button>
              {isMoreOpen && (
                <div className="absolute right-0 bg-white rounded shadow mt-2">
                  {moreItems.map((i) => (
                    <Link
                      key={i.path}
                      to={i.path}
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setIsMoreOpen(false)}
                    >
                      {i.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link to="/cart" className="relative">
              <i className="fa-solid fa-cart-shopping text-lg" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <button
                onClick={() => setIsUserMenuOpen((v) => !v)}
                className="px-3 py-2 bg-green-700 text-white rounded-full"
              >
                {displayName}
              </button>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="px-4 py-2 bg-accent2 text-white rounded-full"
              >
                Login
              </button>
            )}

            {/* Mobile */}
            <button
              className="lg:hidden"
              onClick={() => setIsMobileOpen((v) => !v)}
              aria-label="Mobile menu"
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onOpenRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
        onAuthSuccess={handleAuthSuccess}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onOpenLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default Navbar;
