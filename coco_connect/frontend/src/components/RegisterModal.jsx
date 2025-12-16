import React, { useState, useEffect, useRef } from "react";

import { registerUser, loginUser } from "../services/authService";

export default function RegisterModal({ isOpen, onClose }) {
  const modalRef = useRef();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        email: "",
        role: "",
        password: "",
        confirmPassword: "",
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.id]: e.target.value }));
    if (errors[e.target.id]) setErrors((p) => ({ ...p, [e.target.id]: "" }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Enter a valid email";

    if (!formData.role) newErrors.role = "Please select a role";

    if (!formData.password.trim()) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "At least 6 characters";

    if (!formData.confirmPassword.trim()) newErrors.confirmPassword = "Please confirm your password";
    else if (formData.confirmPassword !== formData.password)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;

  setIsSubmitting(true);
  try {
    // 1) Register
    await registerUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    });

    // 2) Auto-login (get tokens)
    const data = await loginUser(formData.email, formData.password);

    // 3) Save tokens
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);

    // 4) Save user for navbar
    localStorage.setItem(
      "user",
      JSON.stringify({
        name: formData.name,
        email: formData.email,
        role: formData.role,
      })
    );

    onClose();
  } catch (err) {
    setErrors({ submit: "Registration failed. Please try again." });
  } finally {
    setIsSubmitting(false);
  }
};


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
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
        onClick={handleBackdropClick}
        aria-modal="true"
        role="dialog"
      >
        {/* floating dots */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 p1 rounded-full blur-xl"
               style={{ background: "radial-gradient(circle, rgba(0,128,0,.28) 0%, transparent 70%)" }} />
          <div className="absolute bottom-1/3 right-1/4 w-40 h-40 p2 rounded-full blur-2xl"
               style={{ background: "radial-gradient(circle, rgba(34,139,34,.22) 0%, transparent 70%)" }} />
          <div className="absolute top-1/3 right-1/3 w-28 h-28 p3 rounded-full blur-xl"
               style={{ background: "radial-gradient(circle, rgba(0,86,63,.26) 0%, transparent 70%)" }} />
          <div className="absolute bottom-1/4 left-1/2 w-24 h-24 p4 rounded-full blur-lg"
               style={{ background: "radial-gradient(circle, rgba(152,251,152,.25) 0%, transparent 70%)" }} />
          <div className="absolute top-1/6 left-2/3 w-12 h-12 p1 rounded-full blur-md"
               style={{ background: "radial-gradient(circle, rgba(144,238,144,.35) 0%, transparent 70%)" }} />
        </div>

        {/* modal */}
        <div
          ref={modalRef}
          className="bg-white/95 backdrop-blur-lg w-full max-w-md mx-4 rounded-2xl shadow-2xl p-8 relative max-h-[90vh] overflow-y-auto border border-white/40"
          style={{ boxShadow: "0 20px 40px rgba(0, 100, 0, 0.15), 0 0 0 1px rgba(255,255,255,.8)" }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100/70"
          >
            ✕
          </button>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-mont  text-gray-800 mb-2">CREATE ACCOUNT</h2>
            {/*<p className="text-gray-600">Join our agricultural community</p>*/}
          </div>

          {errors.submit && (
            <div className="bg-red-50 text-center p-4 mb-6 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm font-medium">{errors.submit}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border text-gray-800 placeholder:text-gray-400
                  focus:ring-2 focus:outline-none transition-all
                  ${errors.name ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-green-300 hover:border-green-400"}`}
                placeholder="e.g. Saman Perera"
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border text-gray-800 placeholder:text-gray-400
                  focus:ring-2 focus:outline-none transition-all
                  ${errors.email ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-green-300 hover:border-green-400"}`}
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I am a</label>
              <select
                id="role"
                value={formData.role}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border bg-white focus:ring-2 focus:outline-none transition-all
                  ${formData.role === "" ? "text-gray-400" : "text-gray-800"}
                  ${errors.role ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-green-300 hover:border-green-400"}`}
              >
                <option value="" disabled>
                  Select your role
                </option>
                <option value="farmer">Farmer / Producer</option>
                <option value="investor">Investor</option>
                <option value="buyer">Buyer / Customer</option>
              </select>
              {errors.role && <p className="text-red-600 text-sm mt-1">{errors.role}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border text-gray-800 placeholder:text-gray-400
                  focus:ring-2 focus:outline-none transition-all
                  ${errors.password ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-green-300 hover:border-green-400"}`}
                placeholder="Create a strong password"
              />
              {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border text-gray-800 placeholder:text-gray-400
                  focus:ring-2 focus:outline-none transition-all
                  ${errors.confirmPassword ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-green-300 hover:border-green-400"}`}
                placeholder="Re-type your password"
              />
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-lg font-semibold shadow-md flex items-center justify-center text-white transition-all mt-6
                ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 hover:shadow-lg"}`}
            >
              {isSubmitting ? "Creating account..." : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
