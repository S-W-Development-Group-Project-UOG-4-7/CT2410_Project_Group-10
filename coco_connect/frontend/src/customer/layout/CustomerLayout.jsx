import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  User,
  Package,
  LogOut,
  ChevronRight,
  Bell,
  HelpCircle,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";

export default function CustomerLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // ✅ Custom logout modal state
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const mobileMenuRef = useRef(null);

  const user = useMemo(() => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  }, []);

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const initials =
    displayName
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "U";

  const navItems = [
    { path: "/customer", label: "Overview", icon: <Home size={20} /> },
    { path: "/customer/profile", label: "My Profile", icon: <User size={20} /> },
    { path: "/customer/orders", label: "My Orders", icon: <Package size={20} /> },
    { path: "/customer/notifications", label: "Notifications", icon: <Bell size={20} /> },
    { path: "/customer/support", label: "Help & Support", icon: <HelpCircle size={20} /> },
  ];

  const isActivePath = (itemPath) =>
    location.pathname === itemPath || location.pathname.startsWith(itemPath + "/");

  useEffect(() => setIsMobileMenuOpen(false), [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest('[data-menu-toggle]')
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ open modal instead of window.confirm
  const handleLogout = () => setShowLogoutModal(true);

  // ✅ real logout
  const confirmLogout = () => {
    setShowLogoutModal(false);

    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("email");

    navigate("/");
  };

  const getCurrentPageTitle = () => {
    const currentItem = navItems.find(
      (item) =>
        location.pathname === item.path ||
        location.pathname.startsWith(item.path + "/")
    );
    return currentItem?.label || "Dashboard";
  };

  const getBreadcrumbs = () => {
    const paths = location.pathname.split("/").filter(Boolean);
    const filtered = paths.filter((p) => p !== "customer");

    return filtered.map((path, index) => {
      const fullPath = `/customer/${filtered.slice(0, index + 1).join("/")}`.replace(
        "/customer/customer",
        "/customer"
      );
      const item = navItems.find((nav) => nav.path === fullPath);

      return {
        label: item?.label || path.charAt(0).toUpperCase() + path.slice(1),
        path: fullPath,
        isLast: index === filtered.length - 1,
      };
    });
  };

  return (
    <div className="min-h-screen bg-[#ece7e1]">
      {/* ✅ Custom Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowLogoutModal(false)}
          />

          <div className="relative z-10 w-[92%] max-w-md rounded-2xl bg-white shadow-2xl border border-gray-100 p-6 animate-[fadeIn_.18s_ease-out]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Sign out of CocoConnect?
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  You will be logged out and need to sign in again to access your dashboard.
                </p>
              </div>

              <button
                onClick={() => setShowLogoutModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
              >
                Cancel
              </button>

              <button
                onClick={confirmLogout}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-[#2e7d32] px-4 py-3 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <button
            data-menu-toggle
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            className="p-2 rounded-lg hover:bg-white/10 active:scale-95 transition"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* ✅ Correct Logo */}
          <Link to="/" className="logo-text logo-md">
            <span className="coco-text">COCO</span>
            <span className="connect-text">CONNECT</span>
          </Link>

          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm">
            {initials}
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            ref={mobileMenuRef}
            className="absolute left-0 top-0 h-full w-72 bg-[#2e7d32] text-white shadow-xl animate-slideIn flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 pt-6 pb-5 border-b border-green-700 flex gap-3 items-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-base truncate">{displayName}</p>
                <p className="text-sm opacity-80">Customer Portal</p>
              </div>
            </div>

            <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
              {navItems.map((item) => {
                const active = isActivePath(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition
                      ${active ? "bg-white/20 font-semibold" : "hover:bg-white/10"}`}
                  >
                    {item.icon}
                    <span className="flex-1">{item.label}</span>
                    {active && <ChevronRight size={16} />}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-green-700">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-200 hover:bg-red-500/20 transition"
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Layout */}
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`hidden lg:flex flex-col bg-[#2e7d32] text-white min-h-screen transition-all duration-300
            ${isSidebarCollapsed ? "w-20" : "w-64"} sticky top-0`}
        >
          <div className="px-4 py-4 border-b border-green-700 flex items-center justify-between">
            {!isSidebarCollapsed ? (
              /* ✅ Correct Logo */
              <Link to="/" className="logo-text logo-lg">
                <span className="coco-text">COCO</span>
                <span className="connect-text">CONNECT</span>
              </Link>
            ) : (
              <Link
                to="/"
                className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center font-extrabold"
                title="CocoConnect"
              >
                CC
              </Link>
            )}

            <button
              onClick={() => setIsSidebarCollapsed((v) => !v)}
              className="p-2 rounded-lg hover:bg-white/10 active:scale-95 transition"
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronLeft
                size={20}
                className={`transition-transform ${isSidebarCollapsed ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          <div
            className={`px-4 py-5 border-b border-green-700 flex ${
              isSidebarCollapsed ? "justify-center" : "gap-3 items-center"
            }`}
          >
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm">
              {initials}
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <p className="font-semibold truncate">{displayName}</p>
                <p className="text-sm opacity-80">Customer Portal</p>
              </div>
            )}
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const active = isActivePath(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative group flex items-center rounded-xl transition
                    ${isSidebarCollapsed ? "justify-center px-3 py-3" : "px-4 py-3"}
                    ${active ? "bg-white/20 font-semibold" : "hover:bg-white/10"}`}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  {item.icon}
                  {!isSidebarCollapsed && (
                    <>
                      <span className="ml-3 flex-1">{item.label}</span>
                      {active && <ChevronRight size={16} />}
                    </>
                  )}

                  {isSidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition z-50 whitespace-nowrap">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom sign out */}
          <div className="px-3 py-4 border-t border-green-700">
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 w-full rounded-xl text-red-200 hover:bg-red-500/20 transition
                ${isSidebarCollapsed ? "justify-center px-3 py-3" : "px-4 py-3"}`}
              title={isSidebarCollapsed ? "Sign Out" : undefined}
            >
              <LogOut size={20} />
              {!isSidebarCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-h-screen">
          <div className="bg-white border-b shadow-sm px-4 sm:px-6 py-4">
            <div className="flex items-start sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <nav className="flex flex-wrap items-center gap-2 text-sm">
                  <Link to="/" className="text-gray-500 hover:text-[#2e7d32] transition">
                    Home
                  </Link>

                  {getBreadcrumbs().map((crumb, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <ChevronRight size={16} className="text-gray-400" />
                      {crumb.isLast ? (
                        <span className="font-semibold text-gray-900 truncate">
                          {crumb.label}
                        </span>
                      ) : (
                        <Link
                          to={crumb.path}
                          className="text-gray-600 hover:text-[#2e7d32] transition truncate"
                        >
                          {crumb.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </nav>

                <h1 className="text-2xl font-bold text-gray-900 mt-2">
                  {getCurrentPageTitle()}
                </h1>
              </div>

              <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <Bell size={20} />
                </button>
                <div className="h-6 w-px bg-gray-300" />
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  Welcome, <span className="font-semibold">{displayName}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8 py-6 bg-gradient-to-b from-[#f9faf7] to-[#ece7e1] min-h-[calc(100vh-64px)]">
            <div className="max-w-7xl mx-auto">
              <Outlet context={{ handleLogout }} />
            </div>
          </div>
        </main>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slideIn { animation: slideIn 0.25s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
