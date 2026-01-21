import { useEffect, useState } from "react";

const PAYHERE_SCRIPT = "https://www.payhere.lk/lib/payhere.js";

export default function PayHerePayment({ idea, onSuccess, onClose }) {
  const [loading, setLoading] = useState(false);

  // Load PayHere script safely
  useEffect(() => {
    if (window.payhere) return;

    const script = document.createElement("script");
    script.src = PAYHERE_SCRIPT;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const startPayment = () => {
    if (!window.payhere) {
      alert("PayHere not loaded yet. Please try again.");
      return;
    }

    setLoading(true);

    const payment = {
      sandbox: true, // 🔴 set false for LIVE
      merchant_id: "YOUR_MERCHANT_ID", // 🔴 REPLACE WITH REAL ID

      return_url: undefined,
      cancel_url: undefined,
      notify_url: "http://127.0.0.1:8000/api/payhere/notify/",

      order_id: `IDEA_${idea.id}_${Date.now()}`,
      items: idea.title,
      amount: idea.price,
      currency: "LKR",

      first_name: "Buyer",
      last_name: "User",
      email: "buyer@example.com",
      phone: "0771234567",
      address: "Sri Lanka",
      city: "Colombo",
      country: "Sri Lanka",
    };

    // -------------------------
    // PayHere event handlers
    // -------------------------
    window.payhere.onCompleted = function (orderId) {
      setLoading(false);
      alert("✅ Payment successful!");

      // callback for backend unlock / confirmation
      onSuccess?.(orderId);
      onClose();
    };

    window.payhere.onDismissed = function () {
      setLoading(false);
      alert("⚠️ Payment cancelled");
      onClose();
    };

    window.payhere.onError = function (error) {
      setLoading(false);
      alert("❌ Payment error: " + error);
    };

    window.payhere.startPayment(payment);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative border">
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl hover:text-gray-700"
          aria-label="Close"
        >
          ✕
        </button>

        {/* HEADER */}
        <h2 className="text-2xl font-extrabold text-green-700 mb-2">
          Secure Payment
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Complete your purchase via PayHere
        </p>

        {/* IDEA INFO */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="font-semibold text-gray-700 mb-1">Idea</p>
          <p className="text-lg font-bold">{idea.title}</p>

          <p className="mt-3 text-gray-600">Amount</p>
          <p className="text-2xl font-extrabold text-green-700">
            LKR {idea.price}
          </p>
        </div>

        {/* PAY BUTTON */}
        <button
          onClick={startPayment}
          disabled={loading}
          className={`w-full py-3 rounded-xl text-lg font-bold transition
            ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
        >
          {loading ? "Processing..." : "Pay with PayHere"}
        </button>

        {/* CANCEL */}
        <button
          onClick={onClose}
          className="w-full mt-4 py-2 rounded-xl text-gray-600 hover:underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
