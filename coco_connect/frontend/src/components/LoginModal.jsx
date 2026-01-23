import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { loginUser } from "../services/authService";

const API_BASE = "http://localhost:8000/api";

export default function LoginModal({
  isOpen,
  onClose,
  onOpenRegister,
  onAuthSuccess,
}) {
  const modalRef = useRef(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
  };

  const emailRegex = /^\S+@\S+\.\S+$/;
  const passwordRegex = /^.{6,}$/;

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email))
      newErrors.email = "Enter a valid email";

    if (!formData.password.trim()) newErrors.password = "Password is required";
    else if (!passwordRegex.test(formData.password))
      newErrors.password = "At least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.email, formData.password]);

  const getLoginErrorMessage = (err) => {
    const status = err?.response?.status;
    const detail =
      err?.response?.data?.detail ||
      err?.response?.data?.error ||
      err?.message ||
      "";

    const d = String(detail).toLowerCase();

    if (
      status === 400 &&
      (d.includes("username") || d.includes("field is required"))
    ) {
      return "Login payload mismatch. Please try again.";
    }

    if (d.includes("no active account")) {
      return "Your account is inactive. Please contact support.";
    }

    if (
      status === 401 ||
      status === 404 ||
      d.includes("invalid") ||
      d.includes("not found")
    ) {
      return "Account not found. Please register.";
    }

    return "Login failed. Please check your credentials.";
  };

  async function loginFallbackUsername(email, password) {
    const res = await axios.post(`${API_BASE}/token/`, {
      username: email,
      password,
    });
    return res.data;
  }

  const redirectAfterLogin = (role) => {
    const isAdmin = String(role || "").toLowerCase() === "admin";
    const target = isAdmin ? "/admin" : "/";

    onClose?.();
    setTimeout(() => navigate(target), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors((p) => ({ ...p, submit: "" }));

    try {
      let data;

      try {
        data = await loginUser(formData.email, formData.password);
      } catch (err1) {
        if (err1?.response?.status === 400) {
          data = await loginFallbackUsername(formData.email, formData.password);
        } else {
          throw err1;
        }
      }

      const apiUser = data?.user ?? {};
      const access = data?.access;
      const refresh = data?.refresh;

      if (!access) throw new Error("Missing access token");

      localStorage.setItem("access", access);
      if (refresh) localStorage.setItem("refresh", refresh);

      const userObj = {
        id: apiUser?.id ?? null,
        name: apiUser?.name || apiUser?.first_name || formData.email,
        email: apiUser?.email || formData.email,
        role: apiUser?.role || (apiUser?.is_staff ? "admin" : "user"),
        rememberMe,
      };

      localStorage.setItem("user", JSON.stringify(userObj));
      localStorage.setItem("role", userObj.role || "");
      localStorage.setItem("name", userObj.name || "");
      localStorage.setItem("email", userObj.email || "");

      onAuthSuccess?.(userObj);
      redirectAfterLogin(userObj.role);
    } catch (err) {
      setErrors({ submit: getLoginErrorMessage(err) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.id]: e.target.value }));
    if (errors[e.target.id])
      setErrors((p) => ({ ...p, [e.target.id]: "" }));
    if (errors.submit) setErrors((p) => ({ ...p, submit: "" }));
  };

  useEffect(() => {
    if (!isOpen) {
      setFormData({ email: "", password: "" });
      setErrors({});
      setRememberMe(false);
      setShowPassword(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const escClose = (e) => e.key === "Escape" && onClose();
    if (isOpen) {
      document.addEventListener("keydown", escClose);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", escClose);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        onClick={handleBackdropClick}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

        <div
          ref={modalRef}
          className="relative bg-white w-full max-w-md mx-4 rounded-2xl shadow-2xl p-8 z-10"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>

          <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
            Login
          </h2>

          {errors.submit && (
            <div className="bg-red-50 p-3 mb-4 text-center rounded text-red-600">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full px-4 py-3 border rounded-lg"
            />

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full px-4 py-3 border rounded-lg pr-12"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword((p) => !p)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center mt-4 text-sm">
            Don’t have an account?{" "}
            <button
              className="text-green-700 font-semibold"
              onClick={() => {
                onClose();
                onOpenRegister?.();
              }}
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
