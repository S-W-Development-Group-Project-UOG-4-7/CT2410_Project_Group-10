import { useEffect, useState } from "react";
import { Link } from "react-router-dom";


export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/me/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">My Profile</h1>
      <p><b>Name:</b> {user.name}</p>
      <p><b>Email:</b> {user.email}</p>
      <p><b>Role:</b> {user.role}</p>
      <Link
        to="/customer/profile/edit"
        className="inline-block mt-4 bg-green-600 text-white px-4 py-2 rounded"
      >
        Edit Profile
      </Link>

    </div>
  );
}
