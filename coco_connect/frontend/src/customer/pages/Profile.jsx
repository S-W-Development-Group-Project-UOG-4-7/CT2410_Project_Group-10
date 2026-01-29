import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:8000/api";

function safeJsonParse(v, fallback) {
  try {
    return JSON.parse(v);
  } catch {
    return fallback;
  }
}

function getInitials(nameOrEmail = "U") {
  const s = (nameOrEmail || "").trim();
  if (!s) return "U";
  if (s.includes("@")) return s[0].toUpperCase();
  const parts = s.split(" ").filter(Boolean);
  const a = (parts[0]?.[0] || "U").toUpperCase();
  const b = (parts[1]?.[0] || "").toUpperCase();
  return (a + b) || "U";
}

function buildDisplayName(me) {
  const full =
    (me?.full_name || `${me?.first_name || ""} ${me?.last_name || ""}`.trim()).trim();
  return full || me?.name || me?.username || me?.email || "User";
}

/** ✅ Critical: this prevents "undefined undefined" after refresh */
function syncLocalUserFromMe(me) {
  const stored = safeJsonParse(localStorage.getItem("user") || "{}", {});
  const displayName = buildDisplayName(me);

  const updated = {
    ...stored,
    id: me?.id ?? stored?.id,
    email: me?.email ?? stored?.email,
    username: me?.username ?? stored?.username,
    first_name: me?.first_name ?? stored?.first_name,
    last_name: me?.last_name ?? stored?.last_name,
    role: me?.role ?? stored?.role,
    name: displayName, // ✅ Navbar/Topbar should always use this
  };

  localStorage.setItem("user", JSON.stringify(updated));
  return updated;
}

export default function Profile() {
  const navigate = useNavigate();
  const token = useMemo(() => localStorage.getItem("access"), []);

  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState("");

  // password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showCon, setShowCon] = useState(false);

  const loadMe = async () => {
    try {
      setLoading(true);
      setPageError("");

      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch(`${API}/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      const data = await res.json();
      setMe(data);
      syncLocalUserFromMe(data);
    } catch (e) {
      setPageError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayName = buildDisplayName(me);
  const initials = getInitials(displayName || me?.email);
  const roleLabel = me?.role || "buyer";

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    navigate("/");
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    setPwMsg("");
    setPwError("");
    setPageError("");

    if (!currentPassword || !newPassword) {
      setPwError("Please fill current password and new password.");
      return;
    }
    if (newPassword.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }

    try {
      setPwSaving(true);

      const res = await fetch(`${API}/change-password/`, {
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
        handleLogout();
        return;
      }

      if (!res.ok) {
        setPwError(data?.error || data?.detail || "Password update failed");
        return;
      }

      setPwMsg(data?.message || "Password changed successfully ✅");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // optional: logout after change
      setTimeout(() => handleLogout(), 900);
    } catch {
      setPwError("Password update failed");
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-56">
        <div className="animate-spin h-9 w-9 border-b-2 border-green-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header 
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
          <p className="text-sm text-gray-500">
            Manage your personal details and security settings.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setEditOpen(true)}
            className="px-4 py-2 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
          >
            Edit Profile
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>*/}

      {pageError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl">
          {pageError}
        </div>
      )}

      {/* Top card */}
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-5 sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center">
              <span className="text-green-700 font-extrabold text-lg">{initials}</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">{displayName}</h2>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                  {roleLabel}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-0.5">{me?.email || "-"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <InfoPill label="Username" value={me?.username || "-"} />
            <InfoPill label="First Name" value={me?.first_name || "-"} />
            <InfoPill label="Last Name" value={me?.last_name || "-"} />
          </div>
        </div>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Details */}
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900">Profile Details</h3>
          <p className="text-sm text-gray-500 mt-1">
            Your details are used across the platform (dashboard, orders, ideas, etc.).
          </p>

          <div className="mt-5 space-y-4">
            <DetailRow label="Full Name" value={buildDisplayName(me)} />
            <DetailRow label="Email" value={me?.email || "-"} />
            <DetailRow label="Username" value={me?.username || "-"} />
            <DetailRow label="Role" value={me?.role || "-"} />
          </div>

          <div className="mt-6">
            <button
              onClick={() => setEditOpen(true)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-900 text-white font-semibold hover:opacity-95 transition"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900">Security</h3>
          <p className="text-sm text-gray-500 mt-1">
            Change your password. For security, you’ll be logged out after updating.
          </p>

          {(pwMsg || pwError) && (
            <div
              className={`mt-4 p-3 rounded-xl border ${
                pwError
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-green-50 border-green-200 text-green-700"
              }`}
            >
              {pwError || pwMsg}
            </div>
          )}

          <form onSubmit={submitPassword} className="mt-5 space-y-4">
            <PwField
              label="Current Password"
              value={currentPassword}
              setValue={setCurrentPassword}
              show={showCur}
              setShow={setShowCur}
            />
            <PwField
              label="New Password"
              value={newPassword}
              setValue={setNewPassword}
              show={showNew}
              setShow={setShowNew}
              hint="Minimum 6 characters"
            />
            <PwField
              label="Confirm New Password"
              value={confirmPassword}
              setValue={setConfirmPassword}
              show={showCon}
              setShow={setShowCon}
            />

            <button
              type="submit"
              disabled={pwSaving}
              className="w-full px-4 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 transition"
            >
              {pwSaving ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>

      {/* Edit modal component */}
      <EditProfileModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        me={me}
        onSaved={(updatedMe) => {
          setMe(updatedMe);
          syncLocalUserFromMe(updatedMe);
          setEditOpen(false);
        }}
      />
    </div>
  );
}

/* -------------------- small UI components -------------------- */

function InfoPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 px-3 py-2">
      <p className="text-[11px] font-bold text-gray-500">{label}</p>
      <p className="font-semibold text-gray-900 truncate">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-900 text-right break-words">
        {value}
      </p>
    </div>
  );
}

function PwField({ label, value, setValue, show, setShow, hint }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder={hint || ""}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}

/* -------------------- Edit Profile (Reusable Component as Modal) -------------------- */

function EditProfileModal({ open, onClose, me, onSaved }) {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState(me?.first_name || "");
  const [lastName, setLastName] = useState(me?.last_name || "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    if (open) {
      setFirstName(me?.first_name || "");
      setLastName(me?.last_name || "");
      setErr("");
      setOk("");
    }
  }, [open, me]);

  if (!open) return null;

  const save = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    if (!firstName.trim()) {
      setErr("First name is required.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`${API}/me/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (!res.ok) {
        setErr(data?.error || "Failed to update profile");
        return;
      }

      setOk("Profile updated ✅");
      onSaved?.(data);
    } catch {
      setErr("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Edit Profile</h3>
            <p className="text-sm text-gray-500 mt-1">
              Update your name details used across the platform.
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold"
          >
            ✕
          </button>
        </div>

        {(err || ok) && (
          <div
            className={`mt-4 p-3 rounded-xl border ${
              err
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-green-50 border-green-200 text-green-700"
            }`}
          >
            {err || ok}
          </div>
        )}

        <form onSubmit={save} className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name <span className="text-red-600">*</span>
            </label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. Duljaya"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. Gamanayake"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 px-3 py-2">
              <p className="text-[11px] font-bold text-gray-500">Email</p>
              <p className="font-semibold text-gray-900 truncate">{me?.email || "-"}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 px-3 py-2">
              <p className="text-[11px] font-bold text-gray-500">Username</p>
              <p className="font-semibold text-gray-900 truncate">{me?.username || "-"}</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full px-4 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 transition"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
