import React, { useState, useEffect, useRef, useCallback } from "react";
import { Eye, EyeOff } from "lucide-react";
import { loginUser } from "../services/authService";

export default function LoginModal({
  isOpen,
  onClose,
  onOpenRegister,
  onAuthSuccess,
}) {
  const modalRef = useRef();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
  };

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Enter a valid email";

    if (!formData.password.trim()) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "At least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.email, formData.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors((p) => ({ ...p, submit: "" }));

    try {
      // ✅ Call backend JWT token endpoint via authService
      const data = await loginUser(formData.email, formData.password);

      // ✅ Save tokens
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      const userObj = {
        name: formData.email, // later you can replace with real name from backend
        email: formData.email,
        rememberMe,
      };

      localStorage.setItem("user", JSON.stringify(userObj));

      // ✅ tell Navbar immediately
      onAuthSuccess?.(userObj);

      console.log("Logged in with token:", data);

      // ✅ Close modal
      onClose();
    } catch (err) {
      // show a nicer error if backend is down vs wrong password
      setErrors({
        submit:
          err?.response?.data?.detail ||
          "Login failed. Check email/password and make sure Django is running.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.id]: e.target.value }));
    if (errors[e.target.id]) setErrors((p) => ({ ...p, [e.target.id]: "" }));
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
      <style>{`
        @keyframes float1 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(30px,-40px)} 66%{transform:translate(-20px,20px)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(-40px,30px)} 66%{transform:translate(50px,-30px)} }
        @keyframes float3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,-20px) scale(1.2)} }
        @keyframes float4 { 0%,100%{transform:translate(0,0)} 25%{transform:translate(15px,-25px)} 50%{transform:translate(-10px,15px)} 75%{transform:translate(25px,10px)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .animate-fadeIn { animation: fadeIn .25s ease-out; }
        .p1{animation:float1 25s ease-in-out infinite}
        .p2{animation:float2 30s ease-in-out infinite}
        .p3{animation:float3 20s ease-in-out infinite}
        .p4{animation:float4 35s ease-in-out infinite}
      `}</style>

      <div
        className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn"
        onClick={handleBackdropClick}
        aria-modal="true"
        role="dialog"
      >
        {/* overlay */}
        <div className="absolute inset-0 bg-black/25 backdrop-blur-sm"></div>

        {/* floating dots */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          <div
            className="absolute top-1/4 left-1/4 w-40 h-40 p1 rounded-full blur-2xl opacity-80"
            style={{
              background:
                "radial-gradient(circle, rgba(34,197,94,.35) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-1/3 right-1/4 w-48 h-48 p2 rounded-full blur-3xl opacity-70"
            style={{
              background:
                "radial-gradient(circle, rgba(16,185,129,.30) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute top-1/3 right-1/3 w-36 h-36 p3 rounded-full blur-2xl opacity-75"
            style={{
              background:
                "radial-gradient(circle, rgba(132,204,22,.28) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-1/4 left-1/2 w-28 h-28 p4 rounded-full blur-xl opacity-80"
            style={{
              background:
                "radial-gradient(circle, rgba(74,222,128,.30) 0%, transparent 70%)",
            }}
          />
        </div>

        {/* modal */}
        <div
          ref={modalRef}
          className="relative z-20 bg-white/95 backdrop-blur-lg w-full max-w-md mx-4 rounded-2xl shadow-2xl p-8
                     max-h-[90vh] overflow-y-auto border border-white/40"
          style={{
            boxShadow:
              "0 20px 40px rgba(0, 100, 0, 0.15), 0 0 0 1px rgba(255,255,255,.8)",
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100/70"
          >
            ✕
          </button>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-mont text-gray-800 mb-2">LOGIN</h2>
          </div>

          {errors.submit && (
            <div className="bg-red-50 text-center p-4 mb-6 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm font-medium">
                {errors.submit}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border text-gray-800 placeholder:text-gray-400
                  focus:ring-2 focus:outline-none transition-all
                  ${
                    errors.email
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-300 focus:ring-green-300 hover:border-green-400"
                  }`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border pr-12 text-gray-800 placeholder:text-gray-400
                    focus:ring-2 focus:outline-none transition-all
                    ${
                      errors.password
                        ? "border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:ring-green-300 hover:border-green-400"
                    }`}
                  placeholder="••••••••"
                />

                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword((p) => !p)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {errors.password && (
                <p className="text-red-600 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-300"
                />
                <span className="text-sm text-gray-700">Remember me</span>
              </label>

              <button
                type="button"
                className="text-sm text-green-700 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-lg font-semibold shadow-md flex items-center justify-center text-white transition-all mt-2
                ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 hover:shadow-lg"
                }`}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-600">
            Don’t have an account?{" "}
            <button
              type="button"
              className="text-green-700 font-semibold hover:underline"
              onClick={() => {
                onClose();
                onOpenRegister();
              }}
            >
              Create one
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
