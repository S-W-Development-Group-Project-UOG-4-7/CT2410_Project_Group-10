export default function Topbar({ onOpenSidebar, collapsed }) {
  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-[#ece7e1]">
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile hamburger */}
          <button
            onClick={onOpenSidebar}
            className="lg:hidden rounded-xl px-3 py-2 bg-[#f9faf7] hover:bg-[#e8f5e9] border border-[#ece7e1] font-semibold"
            aria-label="Open sidebar"
          >
            ☰
          </button>

          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#6b3f23] truncate">
              Admin Dashboard
            </h2>
            <p className="text-xs text-[#6b3f23]/60 truncate">
              {collapsed ? "Compact mode" : "Welcome back — keep things sunny ☀️"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 rounded-2xl bg-[#f9faf7] border border-[#ece7e1] px-3 py-2">
            <span className="opacity-60">🔎</span>
            <input
              className="bg-transparent outline-none text-sm w-64 placeholder:text-[#6b3f23]/50"
              placeholder="Search users, settings, logs..."
            />
            <kbd className="text-xs px-2 py-1 rounded-lg border border-[#ece7e1] bg-white text-[#6b3f23]/70">
              ⌘K
            </kbd>
          </div>

          {/* Actions */}
          <button
            className="rounded-2xl px-3 py-2 bg-[#f9faf7] hover:bg-[#e8f5e9] border border-[#ece7e1] transition"
            aria-label="Notifications"
            title="Notifications"
          >
            🔔
          </button>

          <button
            className="rounded-2xl px-3 py-2 bg-[#4caf50] text-white font-semibold shadow-sm hover:opacity-90 transition"
            title="Create"
          >
            + New
          </button>

          {/* User */}
          <div className="flex items-center gap-3 pl-2">
            <div className="w-10 h-10 rounded-2xl bg-[#6b3f23] text-white flex items-center justify-center font-bold shadow-sm">
              A
            </div>
            <div className="hidden sm:block">
              <div className="font-bold leading-4">Admin</div>
              <div className="text-xs text-[#6b3f23]/60">Superuser</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
