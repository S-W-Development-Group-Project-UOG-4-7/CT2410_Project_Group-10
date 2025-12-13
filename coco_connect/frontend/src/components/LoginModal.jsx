import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { Eye, EyeOff } from "lucide-react";

export default function LoginModal({ isOpen, onClose, onOpenRegister }) {
  const modalRef = useRef();

  // ---------------------------- FORM STATE ----------------------------
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---------------------------- VALIDATION ----------------------------
  const validateForm = useCallback(() => {
    let newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.email, formData.password]);

  // ---------------------------- SUBMIT ----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // TODO: call backend here later
      await new Promise((res) => setTimeout(res, 1200));
      console.log("Logged in:", { ...formData, rememberMe });
      onClose();
    } catch (err) {
      setErrors({ submit: "Login failed. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------- INPUT CHANGE ----------------------------
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });

    if (errors[e.target.id]) {
      setErrors((prev) => ({ ...prev, [e.target.id]: "" }));
    }
  };

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  // ---------------------------- RESET WHEN CLOSED ----------------------------
  useEffect(() => {
    if (!isOpen) {
      setFormData({ email: "", password: "" });
      setErrors({});
      setRememberMe(false);
      setShowPassword(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // ---------------------------- CLOSE ON ESC ----------------------------
  useEffect(() => {
    const escClose = (e) => {
      if (e.key === "Escape") onClose();
    };

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
    <div
      className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm
                 flex items-center justify-center z-50 animate-fadeIn"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      {/* MODAL BOX */}
      <div
        ref={modalRef}
        className="bg-white w-full max-w-md mx-4 rounded-2xl shadow-2xl p-8
                   animate-slideUp relative max-h-[90vh] overflow-y-auto"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700
                     p-2 rounded-full hover:bg-gray-100"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-3xl font-mont text-center text-gray-800 mb-6">
          LOGIN
        </h2>

        {/* Submit-Level Error */}
        {errors.submit && (
          <div className="bg-red-50 text-center p-3 mb-4 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>

            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border
                focus:ring-2 focus:outline-none transition-all
                ${
                  errors.email
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-green-300"
                }`}
              placeholder="you@example.com"
            />

            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border pr-10
                  focus:ring-2 focus:outline-none transition-all
                  ${
                    errors.password
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-300 focus:ring-green-300"
                  }`}
                placeholder="•••••••••"
              />

              {/* PASSWORD TOGGLE */}
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* REMEMBER + FORGOT */}
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

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-lg font-semibold shadow-md
                        flex items-center justify-center text-white transition-all
              ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* FOOTER (we'll turn this into real registration modal later) */}
        <p className="text-center mt-6 text-sm text-accent6">
  Don’t have an account?{" "}
  <button
    type="button"
    className="text-green-700 font-semibold hover:underline"
    onClick={() => {
      onClose();        // close login modal
      onOpenRegister(); // open register modal
    }}
  >
    Create one
  </button>
</p>

      </div>
    </div>
  );
}
