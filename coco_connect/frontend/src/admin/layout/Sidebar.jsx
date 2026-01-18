import { NavLink } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", path: "/admin" },
  { name: "Products", path: "/admin/products" },
  { name: "Ideas", path: "/admin/ideas", badge: "New" },
  { name: "Investments", path: "/admin/investments" },
  { name: "Users", path: "/admin/users" },
  { name: "News", path: "/admin/news" },
  { name: "Blockchain", path: "/admin/blockchain" },
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
        <div className="px-6 pt-6 pb-5 border-b border-[#ece7e1]">
          <div className="flex items-center justify-between">
            {/* Brand */}
            <div className="leading-none">
              <div className="logo-text">
                <span className="coco-text">Coco</span>
                <span className="connect-text">Connect</span>
              </div>
              {!collapsed && (
                <p className="text-xs text-[#6b3f23]/60 mt-1">
                  Admin Console
                </p>
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

          {/* Collapse toggle */}
          <button
            onClick={onToggleCollapse}
            className="mt-5 hidden lg:flex w-full justify-center rounded-xl px-3 py-2 text-sm font-semibold bg-[#f9faf7] hover:bg-[#e8f5e9] border border-[#ece7e1]"
          >
            {collapsed ? "Expand" : "Collapse"}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-2 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  "relative flex items-center rounded-2xl px-4 py-3 font-semibold transition",
                  "outline-none focus:ring-2 focus:ring-[#4caf50]/40",
                  isActive
                    ? "bg-[#e8f5e9] text-[#2f3e46] shadow-sm"
                    : "hover:bg-[#f2f7f2] text-[#6b3f23]",
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
                      isActive ? "bg-[#4caf50]" : "bg-transparent",
                    ].join(" ")}
                  />

                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.name}</span>

                      {item.badge && (
                        <span className="text-[11px] px-2 py-1 rounded-full border border-[#ece7e1] bg-white text-[#6b3f23]/70">
                          {item.badge}
                        </span>
                      )}

                      {isActive && !item.badge && (
                        <span className="text-[11px] px-2 py-1 rounded-full bg-[#4caf50] text-white">
                          Active
                        </span>
                      )}
                    </>
                  )}

                  {collapsed && <span className="sr-only">{item.name}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-[#ece7e1]">
          <div className="rounded-2xl bg-[#f9faf7] border border-[#ece7e1] p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#6b3f23] text-white grid place-items-center font-bold">
                A
              </div>

              {!collapsed && (
                <div>
                  <div className="font-bold text-[#6b3f23]">Admin</div>
                  <div className="text-xs text-[#6b3f23]/60">
                    admin@coco.local
                  </div>
                </div>
              )}
            </div>

            {!collapsed && (
              <button className="mt-3 w-full rounded-xl px-3 py-2 text-sm font-semibold bg-white hover:bg-[#e8f5e9] border border-[#ece7e1]">
                Log out
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
