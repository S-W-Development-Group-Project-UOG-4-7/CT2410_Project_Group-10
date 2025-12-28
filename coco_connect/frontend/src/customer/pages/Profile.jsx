import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("access");

      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch("http://127.0.0.1:8000/api/me/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load profile");
      }

      const data = await response.json();
      setUser(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  /* -------------------- UI STATES -------------------- */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin h-8 w-8 border-b-2 border-green-600 rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-600 mb-3">{error}</p>
        <button
          onClick={fetchProfile}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  /* -------------------- MAIN UI -------------------- */

  return (
    <div className="max-w-md space-y-4 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <div>
        <p className="text-sm text-gray-500">Name</p>
        <p className="text-lg font-medium">{user?.name}</p>
      </div>

      <div>
        <p className="text-sm text-gray-500">Email</p>
        <p className="text-lg font-medium">{user?.email}</p>
      </div>

      <div>
        <p className="text-sm text-gray-500">Role</p>
        <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
          {user?.role}
        </span>
      </div>

      <div className="flex gap-3 pt-4">
        <Link
          to="/customer/profile/edit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Edit Profile
        </Link>

        <button
          onClick={() => {
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            navigate("/login");
          }}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
