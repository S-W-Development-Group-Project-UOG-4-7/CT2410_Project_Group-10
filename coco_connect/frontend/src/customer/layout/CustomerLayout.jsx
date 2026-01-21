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
    {
      path: "/customer/notifications",
      label: "Notifications",
      icon: <Bell size={20} />,
    },
    {
      path: "/customer/support",
      label: "Help & Support",
      icon: <HelpCircle size={20} />,
    },
  ];

  const isActivePath = (itemPath) =>
    location.pathname === itemPath ||
    location.pathname.startsWith(itemPath + "/");

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

  const handleLogout = () => setShowLogoutModal(true);

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
      {/* ✅ Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowLogoutModal(false)}
          />

          <div className="relative z-10 w-[92%] max-w-md rounded-2xl bg-white shadow-2xl border border-emerald-100 p-6 animate-[fadeIn_.18s_ease-out]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold text-emerald-950">
                  Sign out of CocoConnect?
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  You will be logged out and need to sign in again to access your
                  dashboard.
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

            <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-sm text-emerald-900 font-medium">
                ✅ Tip: You’ll need to login again to access customer pages.
              </p>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
              >
                Cancel
              </button>

              <button
                onClick={confirmLogout}
                className="px-4 py-2 rounded-lg bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Mobile Header (MATCHES SIDEBAR GRADIENT) */}
      <header className="lg:hidden sticky top-0 z-50 text-white shadow-lg border-b border-white/10 bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 px-4 py-3">
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

          <Link to="/" className="logo-text logo-md">
            <span className="text-white">COCO</span>
            <span className="text-lime-300">CONNECT</span>
          </Link>

          <div className="w-9 h-9 bg-white/15 rounded-2xl flex items-center justify-center font-extrabold text-sm border border-white/15">
            {initials}
          </div>
        </div>
      </header>

      {/* ✅ Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            ref={mobileMenuRef}
            className="absolute left-0 top-0 h-full w-72 text-white shadow-xl animate-slideIn flex flex-col
                       bg-gradient-to-b from-emerald-950 via-emerald-900 to-green-950 border-r border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 pt-6 pb-5 border-b border-white/10 flex gap-3 items-center">
              <div className="w-12 h-12 bg-lime-300 text-emerald-950 rounded-2xl flex items-center justify-center font-extrabold text-lg shadow-sm">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-base truncate">{displayName}</p>
                <p className="text-sm text-white/70">Customer Portal</p>
              </div>
            </div>

            <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
              {navItems.map((item) => {
                const active = isActivePath(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={[
                      "relative flex items-center gap-3 px-4 py-3 rounded-2xl transition font-semibold",
                      "outline-none focus:ring-2 focus:ring-lime-300/50",
                      active
                        ? "bg-white/15 text-white shadow-[0_12px_30px_rgba(0,0,0,.22)]"
                        : "text-white/90 hover:bg-white/10 hover:text-white",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "absolute left-0 top-2 bottom-2 w-1 rounded-full transition",
                        active ? "bg-lime-300" : "bg-transparent",
                      ].join(" ")}
                    />
                    {item.icon}
                    <span className="flex-1">{item.label}</span>
                    {active && <ChevronRight size={16} className="text-lime-200" />}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-white/10">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl font-semibold
                           bg-white/10 hover:bg-white/15 border border-white/15 transition"
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
          className={[
            "hidden lg:flex flex-col min-h-screen sticky top-0 transition-all duration-300",
            isSidebarCollapsed ? "w-20" : "w-64",
            "text-white border-r border-white/10",
            "bg-gradient-to-b from-emerald-950 via-emerald-900 to-green-950",
          ].join(" ")}
        >
          <div className="px-4 py-4 border-b border-white/10 flex items-center justify-between">
            {!isSidebarCollapsed ? (
              <Link to="/" className="logo-text logo-lg">
                <span className="text-white">COCO</span>
                <span className="text-lime-300">CONNECT</span>
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
            className={`px-4 py-5 border-b border-white/10 flex ${
              isSidebarCollapsed ? "justify-center" : "gap-3 items-center"
            }`}
          >
            <div className="w-10 h-10 rounded-2xl bg-lime-300 text-emerald-950 grid place-items-center font-extrabold shadow-sm">
              {initials}
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <p className="font-bold truncate">{displayName}</p>
                <p className="text-sm text-white/70">Customer Portal</p>
              </div>
            )}
          </div>

          <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const active = isActivePath(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={[
                    "relative group flex items-center rounded-2xl transition font-semibold",
                    "outline-none focus:ring-2 focus:ring-lime-300/50",
                    isSidebarCollapsed ? "justify-center px-3 py-3" : "px-4 py-3",
                    active
                      ? "bg-white/15 text-white shadow-[0_12px_30px_rgba(0,0,0,.22)]"
                      : "text-white/90 hover:bg-white/10 hover:text-white",
                  ].join(" ")}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <span
                    className={[
                      "absolute left-0 top-2 bottom-2 w-1 rounded-full transition",
                      active ? "bg-lime-300" : "bg-transparent",
                    ].join(" ")}
                  />

                  {item.icon}

                  {!isSidebarCollapsed && (
                    <>
                      <span className="ml-3 flex-1">{item.label}</span>
                      {active && <ChevronRight size={16} className="text-lime-200" />}
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

          <div className="p-3 border-t border-white/10">
            <button
              onClick={handleLogout}
              className={[
                "flex items-center gap-3 w-full rounded-2xl font-semibold transition",
                "bg-white/10 hover:bg-white/15 border border-white/15",
                isSidebarCollapsed ? "justify-center px-3 py-3" : "px-4 py-3",
              ].join(" ")}
              title={isSidebarCollapsed ? "Sign Out" : undefined}
            >
              <LogOut size={20} />
              {!isSidebarCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </aside>

        {/* ✅ Main */}
        <main className="flex-1 min-h-screen">
          {/* ✅ Desktop Topbar (MATCHES SIDEBAR ✅) */}
          <div className="hidden lg:block sticky top-0 z-30 border-b border-white/10 text-white shadow-lg bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950">
            <div className="px-4 sm:px-6 py-4">
              <div className="flex items-start sm:items-center justify-between gap-4">
                <div className="min-w-0">
                  <nav className="flex flex-wrap items-center gap-2 text-sm text-white/80">
                    <Link to="/" className="hover:text-lime-200 transition">
                      Home
                    </Link>

                    {getBreadcrumbs().map((crumb, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <ChevronRight size={16} className="text-white/40" />
                        {crumb.isLast ? (
                          <span className="font-semibold text-white truncate">
                            {crumb.label}
                          </span>
                        ) : (
                          <Link
                            to={crumb.path}
                            className="hover:text-lime-200 transition truncate"
                          >
                            {crumb.label}
                          </Link>
                        )}
                      </div>
                    ))}
                  </nav>

                  <h1 className="text-2xl font-extrabold text-white mt-2">
                    {getCurrentPageTitle()}
                  </h1>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <button className="p-2 rounded-xl hover:bg-white/10 border border-white/10">
                    <Bell size={20} />
                  </button>

                  <div className="h-8 w-px bg-white/15" />

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-lime-300 text-emerald-950 grid place-items-center font-extrabold border border-white/10">
                      {initials}
                    </div>
                    <div className="hidden xl:block">
                      <div className="text-sm font-semibold text-white leading-tight">
                        {displayName}
                      </div>
                      <div className="text-xs text-white/70 leading-tight">
                        Customer Portal
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
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
