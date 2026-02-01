import { useMemo } from "react";

function getInitials(name = "Admin") {
  const parts = String(name).trim().split(" ").filter(Boolean);
  const initials = parts.slice(0, 2).map((p) => p[0]).join("");
  return (initials || "A").toUpperCase();
}

export default function Topbar({ onOpenSidebar, collapsed }) {
  const adminInfo = useMemo(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      const name = u?.name || localStorage.getItem("name") || "Admin";
      const email =
        u?.email || localStorage.getItem("email") || "admin@coco.local";
      return { name, email };
    } catch {
      return { name: "Admin", email: "admin@coco.local" };
    }
  }, []);

  return (
    <header className="sticky top-0 z-30">
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 border-b border-white/10">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onOpenSidebar}
              className="lg:hidden rounded-xl px-3 py-2 font-semibold
                         bg-white/10 hover:bg-white/15 border border-white/15 text-white"
              aria-label="Open sidebar"
            >
              ☰
            </button>

            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white truncate drop-shadow">
                Admin Dashboard
              </h2>
              <p className="text-xs text-white/70 truncate">
                {collapsed
                  ? "Compact mode enabled"
                  : "Welcome back — manage CocoConnect smoothly 🌿"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search 
            <div className="hidden md:flex items-center gap-2 rounded-2xl bg-white/10 border border-white/15 px-3 py-2">
              
              <input
                className="bg-transparent outline-none text-sm w-72 text-white placeholder:text-white/60"
                placeholder="Search users, settings, logs..."
              />
              <kbd className="text-xs px-2 py-1 rounded-lg border border-white/15 bg-white/10 text-white/80">
                ⌘K
              </kbd>
            </div>*/}

            {/* Buttons 
            <button
              className="rounded-2xl px-3 py-2 bg-white/10 hover:bg-white/15 border border-white/15 transition text-white"
              aria-label="Notifications"
              title="Notifications"
              type="button"
              onClick={() => alert("Notifications not wired yet")}
            >
              🔔
            </button>*/}

            {/*<button
              className="hidden sm:inline-flex rounded-2xl px-3 py-2 bg-lime-300 text-emerald-950 font-extrabold shadow-sm hover:opacity-90 transition"
              title="Create"
              type="button"
              onClick={() => alert("Create action not wired yet")}
            >
              + New
            </button>*/}

            {/* User */}
            <div className="flex items-center gap-3 pl-2">
              <div className="w-10 h-10 rounded-2xl bg-lime-300 text-emerald-950 flex items-center justify-center font-extrabold shadow-sm">
                {getInitials(adminInfo.name)}
              </div>

              <div className="hidden sm:block min-w-0">
                <div className="font-bold leading-4 text-white truncate max-w-[180px]">
                  {adminInfo.name}
                </div>
                <div className="text-xs text-white/70 truncate max-w-[180px]">
                  {adminInfo.email}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[2px] bg-gradient-to-r from-lime-300/60 via-white/10 to-lime-300/60" />
      </div>
    </header>
  );
}
