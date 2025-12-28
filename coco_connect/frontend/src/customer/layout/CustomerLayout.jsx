import { Outlet, Link } from "react-router-dom";

export default function CustomerLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white text-black p-4">
        <h2 className="font-bold text-lg mb-4">Customer</h2>
        <nav className="flex flex-col gap-2">
          <Link to="/customer">Overview</Link>
          <Link to="/customer/profile">My Profile</Link>
          <Link to="/customer/orders">My Orders</Link>
        </nav>
      </aside>

      {/* MAIN CONTENT — THIS IS CRITICAL */}
      <main className="flex-1 p-6 bg-[#f9faf7] text-black">
        <Outlet />
      </main>
    </div>
  );
}
