import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
  const [collapsed, setCollapsed] = useState(false); // desktop collapse

  return (
    <div className="min-h-screen bg-[#f9faf7] text-[#5d4037]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
        />
      )}

      <div className="flex min-h-screen">
        <Sidebar
          open={sidebarOpen}
          collapsed={collapsed}
          onClose={() => setSidebarOpen(false)}
          onToggleCollapse={() => setCollapsed((s) => !s)}
        />

        <div className="flex-1 flex flex-col">
          <Topbar
            onOpenSidebar={() => setSidebarOpen(true)}
            collapsed={collapsed}
          />

          <main className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-[1400px] mx-auto">
              <div className="rounded-2xl border border-[#ece7e1] bg-white/70 backdrop-blur-md shadow-sm">
                <div className="p-4 sm:p-6 lg:p-8">{children}</div>
              </div>
            </div>
          </main>

          <footer className="py-6 text-center text-sm text-[#6b3f23]/60">
            © {new Date().getFullYear()} Coco Admin • All systems coconuts 🥥
          </footer>
        </div>
      </div>
    </div>
  );
}
