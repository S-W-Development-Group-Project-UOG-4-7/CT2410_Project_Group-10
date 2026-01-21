import React, { useEffect } from "react";
import { toast } from "react-toastify";

function PayHerePayment({ cartItems, totalAmount, onClose }) {
  useEffect(() => {
    // Load PayHere script
    const script = document.createElement("script");
    script.src = "https://www.payhere.lk/lib/payhere.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const itemsText = cartItems
    .map((item) => `${item.product_name} x${item.quantity}`)
    .join(", ");

  const startPayment = () => {
    const payment = {
      sandbox: true, // change to false for LIVE mode
      merchant_id: "YOUR_MERCHANT_ID", // <-- Replace when ready
      return_url: undefined,
      cancel_url: undefined,
      notify_url: "http://localhost:8000/api/orders/notify/", // Updated placeholder

      order_id: `ORDER_${Date.now()}`,
      items: itemsText,
      amount: totalAmount,
      currency: "LKR",

      first_name: "Demo",
      last_name: "User",
      email: "demo@example.com",
      phone: "0771234567",
      address: "Colombo",
      city: "Colombo",
      country: "Sri Lanka",
    };

    // PayHere Handlers
    window.payhere.onCompleted = function (orderId) {
      toast.success("Payment successful 🎉");
      onClose();
    };

    window.payhere.onDismissed = function () {
      toast.info("Payment cancelled");
      onClose();
    };

    window.payhere.onError = function (error) {
      toast.error("Payment failed: " + error);
    };

    window.payhere.startPayment(payment);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-3xl hover:text-red-500 transition">
          ×
        </button>

        <h2 className="text-2xl font-bold mb-4 text-[#6b3f23]">
          Pay with PayHere
        </h2>

        <div className="mb-4 text-sm text-gray-600 max-h-32 overflow-y-auto">
          <strong>Items:</strong> {itemsText}
        </div>

        <p className="mb-6 text-xl font-bold">Total: Rs. {Number(totalAmount).toFixed(2)}</p>

        <button
          onClick={startPayment}
          className="w-full bg-[#4caf50] text-white py-3 rounded-lg text-lg font-bold hover:bg-[#66bb6a] transition transform hover:scale-105"
        >
          Proceed to PayHere
        </button>

        <button
          onClick={onClose}
          className="w-full bg-gray-100 py-2 rounded-lg mt-4 text-lg hover:bg-gray-200 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default PayHerePayment;
