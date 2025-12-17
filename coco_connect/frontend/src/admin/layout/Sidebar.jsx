import { NavLink } from "react-router-dom";

const menu = [
  { name: "Dashboard", path: "/admin" },
  { name: "Users", path: "/admin/users" },
  { name: "Settings", path: "/admin/blockchain" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r-2 border-[#ece7e1] p-6">
      <h1 className="text-2xl font-bold text-[#6b3f23] mb-8">🥥 Coco Admin</h1>

      <nav className="space-y-3">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block px-4 py-3 rounded-xl font-semibold transition ${
                isActive
                  ? "bg-[#4caf50] text-white"
                  : "bg-[#f9faf7] hover:bg-[#e8f5e9] text-[#6b3f23]"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
