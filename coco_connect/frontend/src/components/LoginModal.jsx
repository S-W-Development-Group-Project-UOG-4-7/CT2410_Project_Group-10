import React from "react";

export default function LoginModal({ isOpen, onClose }) {
  if (!isOpen) return null; // don't show if closed

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center mb-6 text-accent6">
          Login to CocoConnect
        </h2>

        <form className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-accent6">
              Email
            </label>
            <input
              type="email"
              className="w-full mt-1 px-3 py-2 border border-accent3 rounded-lg focus:outline-none focus:ring focus:ring-green-300"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-accent6">
              Password
            </label>
            <input
              type="password"
              className="w-full mt-1 px-3 py-2 border border-accent3 rounded-lg focus:outline-none focus:ring focus:ring-green-300"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-secondary text-white py-2 rounded-lg font-semibold hover:bg-[#3d8c40] transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
