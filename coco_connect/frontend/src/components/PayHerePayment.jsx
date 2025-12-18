import React, { useEffect } from "react";

function PayHerePayment({ idea, onClose }) {
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

  const startPayment = () => {
    const payment = {
      sandbox: true, // change to false for LIVE mode
      merchant_id: "YOUR_MERCHANT_ID", // <-- Replace this!
      return_url: undefined,
      cancel_url: undefined,
      notify_url: "http://your-backend.com/payhere/notify",

      order_id: `ORDER_${Date.now()}`,
      items: idea.title,
      amount: idea.price,
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
      alert("Payment completed! OrderID: " + orderId);
      onClose();
    };

    window.payhere.onDismissed = function () {
      alert("Payment cancelled.");
      onClose();
    };

    window.payhere.onError = function (error) {
      alert("Payment Error: " + error);
    };

    window.payhere.startPayment(payment);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-3xl">
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4 text-[#6b3f23]">
          Pay with PayHere
        </h2>

        <p className="mb-3 text-lg">
          Purchasing: <strong>{idea.title}</strong>
        </p>

        <p className="mb-6 text-xl font-bold">Amount: Rs. {idea.price}</p>

        <button
          onClick={startPayment}
          className="w-full bg-[#4caf50] text-white py-3 rounded-lg text-lg font-bold hover:bg-[#66bb6a]"
        >
          Proceed to PayHere
        </button>

        <button
          onClick={onClose}
          className="w-full bg-gray-400 py-2 rounded-lg mt-4 text-lg"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default PayHerePayment;
