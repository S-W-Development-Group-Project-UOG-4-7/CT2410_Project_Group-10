import { useEffect, useState } from "react";
import { useOutletContext, Link, useNavigate } from "react-router-dom";

export default function Profile() {
  const { handleLogout } = useOutletContext();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("access");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await fetch("http://127.0.0.1:8000/api/me/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          navigate("/login");
          return;
        }

        const data = await res.json();
        setProfile(data);

        // ✅ keep localStorage in sync (optional but useful)
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...storedUser,
            first_name: data.first_name,
            last_name: data.last_name,
            name: data.full_name || `${data.first_name} ${data.last_name}`.trim(),
            email: data.email,
            role: data.role,
            username: data.username,
          })
        );
      } catch (e) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin h-8 w-8 border-b-2 border-green-600 rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg">
        {error}
      </div>
    );
  }

  const firstName = profile?.first_name || "";
  const lastName = profile?.last_name || "";
  const fullName = profile?.full_name || `${firstName} ${lastName}`.trim() || "-";

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-bold mb-6">My Profile</h2>

        <div className="space-y-4 text-gray-700">
          <div>
            <p className="text-sm text-gray-500">Full Name</p>
            <p className="font-semibold">{fullName}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">First Name</p>
            <p className="font-semibold">{firstName || "-"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Last Name</p>
            <p className="font-semibold">{lastName || "-"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-semibold">{profile?.email || "-"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Username</p>
            <p className="font-semibold">{profile?.username || "-"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Role</p>
            <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
              {profile?.role || "User"}
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
