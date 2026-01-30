import { NavLink, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";

const menuItems = [
  { name: "Dashboard", path: "/admin" },
  { name: "Products", path: "/admin/products" },
  { name: "Ideas", path: "/admin/ideas", badge: "New" },
  { name: "Investments", path: "/admin/investments" },
  { name: "Users", path: "/admin/users" },
  { name: "News", path: "/admin/news" },
  { name: "Blockchain", path: "/admin/blockchain" },
];

// ✅ Small logout modal (custom message)
function LogoutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div
        className="relative z-[81] w-full max-w-md mx-4 rounded-2xl border border-white/20
                   bg-white/95 shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-extrabold text-emerald-950">
              Log out of Admin?
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              This will clear your session from this browser.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl px-3 py-2 text-sm font-semibold bg-gray-100 hover:bg-gray-200"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-900 font-medium">
            ✅ Tip: You’ll need to login again to access admin pages.
          </p>
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 font-semibold border border-gray-200 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-xl px-4 py-2 font-semibold bg-emerald-700 text-white hover:bg-emerald-800"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

function getInitials(name = "Admin") {
  const parts = String(name).trim().split(" ").filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
  return (initials || "A").toUpperCase();
}

export default function Sidebar({
  open,
  collapsed,
  onClose,
  onToggleCollapse,
}) {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  const adminInfo = useMemo(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return {
        name: u?.name || localStorage.getItem("name") || "Admin",
        email: u?.email || localStorage.getItem("email") || "admin@coco.local",
      };
    } catch {
      return { name: "Admin", email: "admin@coco.local" };
    }
  }, []);

  const doLogout = () => {
    // clear tokens/session keys you already use
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("email");

    setShowLogout(false);
    navigate("/"); // or "/login" if you have a route
  };

  return (
    <>
      <aside
        className={[
          "fixed lg:sticky top-0 z-40 h-screen",
          "transition-all duration-200",
          collapsed ? "w-20" : "w-72",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",

          // ✅ theme
          "text-white border-r border-white/10",
          "bg-gradient-to-b from-emerald-950 via-emerald-900 to-green-950",
        ].join(" ")}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-6 pt-6 pb-5 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="leading-none min-w-0">
                <div className="logo-text drop-shadow whitespace-nowrap">
                  <span className="text-white">Coco</span>
                  <span className="text-lime-300">Connect</span>
                </div>

                {!collapsed && (
                  <p className="text-xs text-white/70 mt-1 truncate">
                    Admin Console
                  </p>
                )}
              </div>

              <button
                onClick={onClose}
                className="lg:hidden rounded-xl px-3 py-2 text-sm font-semibold
                           bg-white/10 hover:bg-white/15 border border-white/15"
                aria-label="Close sidebar"
              >
                ✕
              </button>
            </div>

            {/* Collapse toggle */}
            <button
              onClick={onToggleCollapse}
              className="mt-5 hidden lg:flex w-full justify-center rounded-xl px-3 py-2 text-sm font-semibold
                         bg-white/10 hover:bg-white/15 border border-white/15"
            >
              {collapsed ? "Expand" : "Collapse"}
            </button>
          </div>

          {/* Navigation (NO ICONS ✅) */}
          <nav className="p-3 space-y-2 flex-1 overflow-y-auto sidebar-scroll-green">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  [
                    "relative flex items-center rounded-2xl px-4 py-3 font-semibold transition",
                    "outline-none focus:ring-2 focus:ring-lime-300/50",
                    collapsed ? "justify-center px-3" : "",
                    isActive
                      ? "bg-white/15 text-white shadow-[0_12px_30px_rgba(0,0,0,.22)]"
                      : "text-white/90 hover:bg-white/10 hover:text-white",
                  ].join(" ")
                }
                title={collapsed ? item.name : undefined}
              >
                {({ isActive }) => (
                  <>
                    {/* Active indicator */}
                    <span
                      className={[
                        "absolute left-0 top-2 bottom-2 w-1 rounded-full transition",
                        isActive ? "bg-lime-300" : "bg-transparent",
                      ].join(" ")}
                    />

                    {/* If collapsed, show small dot (no icons) */}
                    {collapsed ? (
                      <span
                        className={[
                          "w-2.5 h-2.5 rounded-full",
                          isActive ? "bg-lime-300" : "bg-white/40",
                        ].join(" ")}
                        aria-hidden="true"
                      />
                    ) : (
                      <>
                        <span className="flex-1">{item.name}</span>

                        {item.badge && (
                          <span className="text-[11px] px-2 py-1 rounded-full border border-white/20 bg-white/10 text-white/90">
                            {item.badge}
                          </span>
                        )}

                        {isActive && !item.badge && (
                          <span className="text-[11px] px-2 py-1 rounded-full bg-lime-300 text-emerald-950 font-extrabold">
                            Active
                          </span>
                        )}
                      </>
                    )}

                    <span className="sr-only">{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Footer (logout stays here ✅) */}
          <div className="p-3 border-t border-white/10">
            <div className="rounded-2xl bg-white/10 border border-white/15 p-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-lime-300 text-emerald-950 grid place-items-center font-extrabold shadow-sm">
                  {getInitials(adminInfo.name)}
                </div>

                {!collapsed && (
                  <div className="min-w-0">
                    <div className="font-bold text-white truncate">
                      {adminInfo.name}
                    </div>
                    <div className="text-xs text-white/70 truncate">
                      {adminInfo.email}
                    </div>
                  </div>
                )}
              </div>

              {!collapsed && (
                <button
                  onClick={() => setShowLogout(true)}
                  className="mt-3 w-full rounded-xl px-3 py-2 text-sm font-semibold
                             bg-white/10 hover:bg-white/15 border border-white/15"
                >
                  Log out
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      <LogoutModal
        isOpen={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={doLogout}
      />
    </>
  );
}
