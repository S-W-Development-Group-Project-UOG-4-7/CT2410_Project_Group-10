import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

const PAYHERE_SCRIPT = "https://www.payhere.lk/lib/payhere.js";
const API_BASE = (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) || "http://127.0.0.1:8000/api";

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

  const downloadInvoice = async (orderId, token) => {
    try {
      const res = await fetch(`${API_BASE}/products/payhere/invoice/${orderId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || "Invoice download failed.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice_${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Invoice download error:", err);
      toast.error(err?.message || "Invoice download failed.");
    }
  };

  const clearCart = async (token) => {
    try {
      await fetch(`${API_BASE}/products/cart/clear/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error("Cart clear error:", err);
    }
  };

  const markPaid = async (orderId, token) => {
    try {
      await fetch(`${API_BASE}/products/payhere/complete/${orderId}/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error("Mark paid error:", err);
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

  const startPayment = async () => {
    if (!window.payhere) {
      toast.info("PayHere is still loading. Please try again in a moment.");
      return;
    }

    if (!amount || Number.isNaN(amount) || amount <= 0) {
      toast.error("Invalid amount. Please check your order and try again.");
      return;
    }

    setLoading(true);

    const token = authToken || localStorage.getItem("access");
    if (!token) {
      setLoading(false);
      toast.error("Please sign in to continue.");
      return;
    }

    const endpoint = isCartCheckout
      ? `${API_BASE}/products/payhere/init-cart/`
      : `${API_BASE}/payhere/init-idea/`;

    const payload = isCartCheckout ? {} : { idea_id: idea?.id };

    let payment = null;
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.detail || "Payment init failed.");
      }

      payment = await response.json();
    } catch (err) {
      console.error("PayHere init error:", err);
      toast.error(err?.message || "Payment init failed.");
      setLoading(false);
      return;
    }

    // -------------------------
    // PayHere event handlers
    // -------------------------
    window.payhere.onCompleted = async function (orderId) {
      setLoading(false);
      toast.info("Payment completed. Verifying...");

      // callback for backend unlock / confirmation
      if (isCartCheckout) {
        toast.success("Payment completed.");
        await markPaid(orderId, token);
        await clearCart(token);
        await downloadInvoice(orderId, token);
        onSuccess?.(orderId);
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
