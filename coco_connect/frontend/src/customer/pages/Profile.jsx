import { useOutletContext, Link } from "react-router-dom";

export default function Profile() {
  const { handleLogout } = useOutletContext();

  // ✅ read user safely
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  // ✅ support multiple backend/localStorage shapes:
  // - first_name / last_name (Django auth_user)
  // - firstName / lastName (camelCase)
  // - name (single field)
  const firstName = user.first_name || user.firstName || "";
  const lastName = user.last_name || user.lastName || "";

  const fullName =
    (firstName || lastName)
      ? `${firstName} ${lastName}`.trim()
      : (user.name || "-");

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-bold mb-6">My Profile</h2>

        <div className="space-y-4 text-gray-700">
          {/* Full Name */}
          <div>
            <p className="text-sm text-gray-500">Full Name</p>
            <p className="font-semibold">{fullName}</p>
          </div>

          {/* First Name */}
          <div>
            <p className="text-sm text-gray-500">First Name</p>
            <p className="font-semibold">{firstName || "-"}</p>
          </div>

          {/* Last Name */}
          <div>
            <p className="text-sm text-gray-500">Last Name</p>
            <p className="font-semibold">{lastName || "-"}</p>
          </div>

          {/* Email */}
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-semibold">{user.email || "-"}</p>
          </div>

          {/* Role */}
          <div>
            <p className="text-sm text-gray-500">Role</p>
            <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
              {user.role || "User"}
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/customer/profile/edit"
            className="px-5 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition"
          >
            Edit Profile
          </Link>

          <button
            onClick={handleLogout}
            className="px-5 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
