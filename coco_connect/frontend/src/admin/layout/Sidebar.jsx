import { NavLink } from "react-router-dom";

/**
 * Professional sidebar:
 * - No emoji icons
 * - Uses your CocoConnect logo text styles from index.css:
 *   .logo-text, .coco-text, .connect-text
 */
const menu = [
  { name: "Dashboard", path: "/admin" },
  { name: "Users", path: "/admin/users" },
  { name: "Settings", path: "/admin/blockchain" },
];

export default function Sidebar({ open, collapsed, onClose, onToggleCollapse }) {
  return (
    <aside
      className={[
        "fixed lg:sticky top-0 z-40 h-screen",
        "bg-white/80 backdrop-blur-md border-r border-[#ece7e1]",
        "transition-all duration-200",
        collapsed ? "w-20" : "w-72",
        "lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      ].join(" ")}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="px-4 pt-5 pb-4 border-b border-[#ece7e1]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Brand mark */}
              <div className="w-10 h-10 rounded-2xl bg-white border border-[#ece7e1] shadow-sm grid place-items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#4caf50]" />
              </div>

              {!collapsed && (
                <div className="min-w-0 leading-none">
                  {/* CocoConnect logo text (from your index.css) */}
                  <div className="logo-text truncate">
                    <span className="coco-text">Coco</span>
                    <span className="connect-text">Connect</span>
                  </div>
                  <p className="text-xs text-[#6b3f23]/60 truncate mt-1">
                    Admin Console
                  </p>
                </div>
              )}
            </div>

            {/* Mobile close */}
            <button
              onClick={onClose}
              className="lg:hidden rounded-xl px-3 py-2 text-sm font-semibold bg-[#f9faf7] hover:bg-[#e8f5e9] border border-[#ece7e1]"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>

          {/* Collapse toggle (desktop) */}
          <button
            onClick={onToggleCollapse}
            className="mt-4 hidden lg:flex w-full items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold bg-[#f9faf7] hover:bg-[#e8f5e9] border border-[#ece7e1] transition"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? "Expand" : "Collapse"}
          </button>
        </div>

        {/* Nav */}
        <nav className="p-3 space-y-2 flex-1 overflow-y-auto">
          <div className="px-2 pb-2">
            {!collapsed && (
              <div className="text-[11px] uppercase tracking-wider text-[#6b3f23]/50 font-semibold">
                Navigation
              </div>
            )}
          </div>

          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  "group relative flex items-center rounded-2xl px-3 py-3 font-semibold transition",
                  "outline-none focus:ring-2 focus:ring-[#4caf50]/40",
                  isActive
                    ? "bg-[#e8f5e9] text-[#2f3e46] shadow-sm"
                    : "hover:bg-[#f2f7f2] text-[#6b3f23]",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active indicator bar */}
                  <span
                    className={[
                      "absolute left-0 top-2 bottom-2 w-1 rounded-full transition",
                      isActive ? "bg-[#4caf50]" : "bg-transparent",
                    ].join(" ")}
                  />

                  {/* Minimal dot indicator (no icons) */}
                  <span
                    className={[
                      "ml-2 mr-3 h-2 w-2 rounded-full transition",
                      isActive ? "bg-[#4caf50]" : "bg-[#6b3f23]/20",
                      collapsed ? "ml-1 mr-0" : "",
                    ].join(" ")}
                    aria-hidden="true"
                  />

                  {!collapsed ? (
                    <span className="flex-1">{item.name}</span>
                  ) : (
                    // When collapsed, keep layout clean and show a tooltip on hover
                    <span className="sr-only">{item.name}</span>
                  )}

                  {!collapsed && isActive && (
                    <span className="text-[11px] px-2 py-1 rounded-full bg-[#4caf50] text-white">
                      Active
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="p-3 border-t border-[#ece7e1]">
          <div className="rounded-2xl bg-[#f9faf7] border border-[#ece7e1] p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#6b3f23] text-white grid place-items-center font-bold">
                A
              </div>

              {!collapsed && (
                <div className="min-w-0">
                  <div className="font-bold text-[#6b3f23] truncate">Admin</div>
                  <div className="text-xs text-[#6b3f23]/60 truncate">
                    admin@coco.local
                  </div>
                </div>
              )}
            </div>

            {!collapsed && (
              <button className="mt-3 w-full rounded-xl px-3 py-2 text-sm font-semibold bg-white hover:bg-[#e8f5e9] border border-[#ece7e1] transition">
                Log out
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
