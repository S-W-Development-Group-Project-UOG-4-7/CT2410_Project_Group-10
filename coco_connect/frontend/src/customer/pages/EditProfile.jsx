import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
  const navigate = useNavigate();

  // -------------------- Profile fields --------------------
  const [username, setUsername] = useState(""); // ✅ NEW
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // -------------------- Password fields --------------------
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // show/hide
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // -------------------- UI states --------------------
  const [initialLoading, setInitialLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [pageError, setPageError] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  // field-level errors
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  const token = useMemo(() => localStorage.getItem("access"), []);

  // -------------------- Regex validations --------------------
  // Username: 3–30 chars, starts with letter, letters/numbers/._ only (no spaces)
//  const usernameRegex = /^[A-Za-z][A-Za-z0-9._]{2,29}$/;
  const usernameRegex = /^[\w.@+-]{3,150}$/;


  // Names: 2–50, letters + spaces + . ' -
  const nameRegex = /^[A-Za-z\s.'-]{2,50}$/;

  // Password: min 6 (keep simple)
  const passwordRegex = /^.{6,}$/;

  /* -------------------- AUTH GUARD -------------------- */
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  /* -------------------- LOAD CURRENT PROFILE -------------------- */
  const loadProfile = async () => {
    try {
      setInitialLoading(true);
      setPageError("");
      setProfileMsg("");
      setPasswordMsg("");

      const res = await fetch("http://127.0.0.1:8000/api/me/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        navigate("/login");
        return;
      }

      if (!res.ok) throw new Error("Failed to load profile");

      const data = await res.json();

      // ✅ read what backend returns
      setUsername(data?.username || data?.email || "");
      setFirstName(data?.first_name || "");
      setLastName(data?.last_name || "");
    } catch (err) {
      setPageError(err?.message || "Something went wrong");
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------------------- VALIDATIONS -------------------- */
  const validateProfile = () => {
    const e = {};
    const un = username.trim();
    const fn = firstName.trim();
    const ln = lastName.trim();

    if (!un) e.username = "Username is required";
    else if (!usernameRegex.test(un))
      e.username =
        "Username must be 3–30 chars, start with a letter, and use only letters/numbers/._";

    if (!fn) e.firstName = "First name is required";
    else if (!nameRegex.test(fn)) e.firstName = "Use only letters and spaces (2–50 chars)";

    if (ln && !nameRegex.test(ln)) e.lastName = "Use only letters and spaces (2–50 chars)";

    setProfileErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePassword = () => {
    const e = {};
    if (!currentPassword) e.currentPassword = "Current password is required";

    if (!newPassword) e.newPassword = "New password is required";
    else if (!passwordRegex.test(newPassword)) e.newPassword = "Minimum 6 characters";

    if (!confirmPassword) e.confirmPassword = "Confirm your new password";
    else if (newPassword !== confirmPassword) e.confirmPassword = "Passwords do not match";

    setPasswordErrors(e);
    return Object.keys(e).length === 0;
  };

  /* -------------------- UPDATE PROFILE -------------------- */
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setPageError("");
    setProfileMsg("");
    setPasswordMsg("");

    if (!validateProfile()) return;

    try {
      setSavingProfile(true);

      const res = await fetch("http://127.0.0.1:8000/api/me/", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(), // ✅ NEW (requires backend support)
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        navigate("/login");
        return;
      }

      // ✅ show backend message if username taken etc.
      if (!res.ok) throw new Error(data?.error || "Failed to update profile");

      // ✅ sync localStorage user for Navbar/Profile
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = {
        ...storedUser,
        username: username.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        // keep email same if you use it as display
        email: storedUser.email,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setProfileMsg("Profile updated successfully ✅");
    } catch (err) {
      setPageError(err?.message || "Update failed");
    } finally {
      setSavingProfile(false);
    }
  };

  /* -------------------- CHANGE PASSWORD -------------------- */
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPageError("");
    setProfileMsg("");
    setPasswordMsg("");

    if (!validatePassword()) return;

    try {
      setSavingPassword(true);

      const res = await fetch("http://127.0.0.1:8000/api/change-password/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        navigate("/login");
        return;
      }

      if (!res.ok) throw new Error(data?.error || "Password update failed");

      setPasswordMsg("Password changed successfully ✅");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // optional: force logout after password change
      setTimeout(() => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        localStorage.removeItem("email");
        navigate("/");
      }, 900);
    } catch (err) {
      setPageError(err?.message || "Password update failed");
    } finally {
      setSavingPassword(false);
    }
  };

  /* -------------------- LOADING -------------------- */
  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-52">
        <div className="animate-spin h-9 w-9 border-b-2 border-green-600 rounded-full" />
      </div>
    );
  }

  const fullNamePreview = `${firstName} ${lastName}`.trim() || "-";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-sm text-gray-500">
            Manage your personal details, username and password.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/customer/profile")}
          className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition font-semibold"
        >
          ← Back to Profile
        </button>
      </div>

      {/* Page Error */}
      {pageError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          {pageError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* -------------------- PROFILE CARD -------------------- */}
        <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
          <p className="text-sm text-gray-500 mt-1">
            Update username, first name and last name.
          </p>

          {profileMsg && (
            <div className="mt-4 bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg">
              {profileMsg}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="mt-5 space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username <span className="text-red-600">*</span>
              </label>
              <input
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setProfileErrors((p) => ({ ...p, username: "" }));
                  setPageError("");
                  setProfileMsg("");
                }}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2
                  ${profileErrors.username ? "border-red-400 focus:ring-red-200" : "focus:ring-green-500"}`}
                placeholder="e.g. duljaya.g"
              />
              <p className="text-xs text-gray-500 mt-1">
                Allowed: letters, numbers, dot, underscore. Must start with a letter.
              </p>
              {profileErrors.username && (
                <p className="text-sm text-red-600 mt-1">{profileErrors.username}</p>
              )}
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-600">*</span>
              </label>
              <input
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setProfileErrors((p) => ({ ...p, firstName: "" }));
                  setPageError("");
                  setProfileMsg("");
                }}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2
                  ${profileErrors.firstName ? "border-red-400 focus:ring-red-200" : "focus:ring-green-500"}`}
                placeholder="e.g. Duljaya"
              />
              {profileErrors.firstName && (
                <p className="text-sm text-red-600 mt-1">{profileErrors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  setProfileErrors((p) => ({ ...p, lastName: "" }));
                  setPageError("");
                  setProfileMsg("");
                }}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2
                  ${profileErrors.lastName ? "border-red-400 focus:ring-red-200" : "focus:ring-green-500"}`}
                placeholder="e.g. Gamanayake"
              />
              {profileErrors.lastName && (
                <p className="text-sm text-red-600 mt-1">{profileErrors.lastName}</p>
              )}
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm text-gray-700">
              <span className="font-semibold">Full Name Preview:</span>{" "}
              {fullNamePreview}
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition"
            >
              {savingProfile ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>

        {/* -------------------- PASSWORD CARD -------------------- */}
        <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
          <p className="text-sm text-gray-500 mt-1">
            For security, you’ll be logged out after changing password.
          </p>

          {passwordMsg && (
            <div className="mt-4 bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg">
              {passwordMsg}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
            {/* Current */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="flex gap-2">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    setPasswordErrors((p) => ({ ...p, currentPassword: "" }));
                    setPageError("");
                    setPasswordMsg("");
                  }}
                  className={`flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2
                    ${passwordErrors.currentPassword ? "border-red-400 focus:ring-red-200" : "focus:ring-green-500"}`}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold"
                >
                  {showCurrent ? "Hide" : "Show"}
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="text-sm text-red-600 mt-1">{passwordErrors.currentPassword}</p>
              )}
            </div>

            {/* New */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="flex gap-2">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordErrors((p) => ({ ...p, newPassword: "" }));
                    setPageError("");
                    setPasswordMsg("");
                  }}
                  className={`flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2
                    ${passwordErrors.newPassword ? "border-red-400 focus:ring-red-200" : "focus:ring-green-500"}`}
                  placeholder="Minimum 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold"
                >
                  {showNew ? "Hide" : "Show"}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <p className="text-sm text-red-600 mt-1">{passwordErrors.newPassword}</p>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <div className="flex gap-2">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordErrors((p) => ({ ...p, confirmPassword: "" }));
                    setPageError("");
                    setPasswordMsg("");
                  }}
                  className={`flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2
                    ${passwordErrors.confirmPassword ? "border-red-400 focus:ring-red-200" : "focus:ring-green-500"}`}
                  placeholder="Re-type new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold"
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">{passwordErrors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="w-full bg-[#2e7d32] text-white px-5 py-2.5 rounded-lg font-semibold hover:opacity-95 disabled:opacity-50 transition"
            >
              {savingPassword ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
