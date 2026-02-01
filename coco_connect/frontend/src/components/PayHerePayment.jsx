import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

const PAYHERE_SCRIPT = "https://www.payhere.lk/lib/payhere.js";

export default function PayHerePayment({
  idea,
  cartItems,
  totalAmount,
  subtotal,
  tax,
  shipping,
  authToken,
  onSuccess,
  onClose,
}) {
  const [loading, setLoading] = useState(false);
  const [payhereReady, setPayhereReady] = useState(false);
  const [merchantIdInput, setMerchantIdInput] = useState("");
  const isCartCheckout = Array.isArray(cartItems) && cartItems.length > 0;
  const amount = isCartCheckout
    ? Number(totalAmount || 0)
    : Number(idea?.price || 0);

  const itemsLabel = useMemo(() => {
    if (isCartCheckout) {
      const names = cartItems
        .map((item) => item?.product_name)
        .filter(Boolean)
        .slice(0, 3);
      if (names.length > 0) {
        const more = cartItems.length - names.length;
        return more > 0 ? `${names.join(", ")} + ${more} more` : names.join(", ");
      }
      return `Cart Items (${cartItems.length})`;
    }
    return idea?.title || "Purchase";
  }, [cartItems, idea, isCartCheckout]);
  const envMerchantId =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_PAYHERE_MERCHANT_ID) ||
    "";
  const merchantId = (envMerchantId || merchantIdInput || "").trim();
  const checkoutSubtotal = Number(subtotal || 0);
  const checkoutTax = Number(tax || 0);
  const checkoutShipping = Number(shipping || 0);

  useEffect(() => {
    if (envMerchantId) return;
    const saved = localStorage.getItem("payhere_merchant_id") || "";
    if (saved) setMerchantIdInput(saved);
  }, [envMerchantId]);

  const finalizeCheckout = async (orderId) => {
    const token = authToken || localStorage.getItem("access");
    if (!token) {
      toast.error("Please sign in to complete checkout.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/products/checkout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          payment_provider: "payhere",
          payhere_order_id: orderId,
          total_amount: amount,
          currency: "LKR",
          subtotal: checkoutSubtotal,
          tax: checkoutTax,
          shipping: checkoutShipping,
          items_label: itemsLabel,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save checkout details.");
      }

      return await response.json();
    } catch (err) {
      console.error("Checkout save error:", err);
      toast.error("Payment received, but checkout save failed.");
      return null;
    }
  };

  // Load PayHere script safely
  useEffect(() => {
    if (window.payhere) {
      setPayhereReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = PAYHERE_SCRIPT;
    script.async = true;
    script.onload = () => setPayhereReady(true);
    script.onerror = () => setPayhereReady(false);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const startPayment = () => {
    if (!window.payhere) {
      toast.info("PayHere is still loading. Please try again in a moment.");
      return;
    }

    if (!amount || Number.isNaN(amount) || amount <= 0) {
      toast.error("Invalid amount. Please check your order and try again.");
      return;
    }

    if (!merchantId || merchantId === "YOUR_MERCHANT_ID") {
      toast.error("Please set your PayHere merchant ID to continue.");
      return;
    }

    setLoading(true);

    const payment = {
      sandbox: true, // 🔴 set false for LIVE
      merchant_id: merchantId,

      return_url: undefined,
      cancel_url: undefined,
      notify_url: "http://127.0.0.1:8000/api/payhere/notify/",

      order_id: isCartCheckout
        ? `CART_${Date.now()}`
        : `IDEA_${idea?.id || "NA"}_${Date.now()}`,
      items: itemsLabel,
      amount,
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
    window.payhere.onCompleted = async function (orderId) {
      setLoading(false);
      toast.success("Payment successful.");

      // callback for backend unlock / confirmation
      if (isCartCheckout) {
        const saved = await finalizeCheckout(orderId);
        onSuccess?.(saved || orderId);
        onClose();
        return;
      }

      onSuccess?.(orderId);
      onClose();
    };

    window.payhere.onDismissed = function () {
      setLoading(false);
      toast.info("Payment cancelled.");
      onClose();
    };

    window.payhere.onError = function (error) {
      setLoading(false);
      toast.error(`Payment error: ${error}`);
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

        {/* SUMMARY */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="font-semibold text-gray-700 mb-1">
            {isCartCheckout ? "Order" : "Idea"}
          </p>
          <p className="text-lg font-bold">{itemsLabel}</p>

          <p className="mt-3 text-gray-600">Amount</p>
          <p className="text-2xl font-extrabold text-green-700">
            LKR {amount.toFixed(2)}
          </p>
        </div>

        {!envMerchantId && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              PayHere Merchant ID (Sandbox)
            </label>
            <input
              type="text"
              value={merchantIdInput}
              onChange={(e) => {
                const value = e.target.value;
                setMerchantIdInput(value);
                localStorage.setItem("payhere_merchant_id", value);
              }}
              placeholder="Enter your PayHere merchant ID"
              className="w-full rounded-lg px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
        )}

        {/* PAY BUTTON */}
        <button
          onClick={startPayment}
          disabled={loading || !payhereReady}
          className={`w-full py-3 rounded-xl text-lg font-bold transition
            ${
              loading || !payhereReady
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
