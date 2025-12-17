import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-[#f9faf7] text-[#5d4037]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
