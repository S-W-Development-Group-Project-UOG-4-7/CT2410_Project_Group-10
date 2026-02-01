import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import shopBg from "../assets/shopbg.png";
import { useCart } from "../context/CartContext";
import PayHerePayment from "../components/PayHerePayment";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const { setCartCount } = useCart();
  const navigate = useNavigate();

  const [token, setToken] = useState(() => localStorage.getItem("access"));

  const shipping = 12;
  const taxRate = 0.08;

  // =========================
  // FETCH CART
  // =========================
  const errorShown = React.useRef(false);

  const fetchCart = async () => {
    if (!token) {
      setCartItems([]);
      setCartCount(0);
      setLoading(false);
      setIsLoginOpen(true);
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/products/cart/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        setCartItems([]);
        setCartCount(0);
        setLoading(false);
        setIsLoginOpen(true);
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch");
      }

      const data = await res.json();
      setCartItems(data.items || []);
      setCartCount(data.total_items || 0);
    } catch (err) {
      // 🔒 RULES
      if (cartItems.length > 0) return;

      if (!errorShown.current) {
        toast.info("Please login to view your cart");
        errorShown.current = true;
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token]);

  useEffect(() => {
    const syncAuth = () => {
      const nextToken = localStorage.getItem("access");
      setToken(nextToken);
      if (!nextToken) {
        setCartItems([]);
        setCartCount(0);
        setLoading(false);
        setIsLoginOpen(true);
      }
    };

    window.addEventListener("auth:changed", syncAuth);
    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener("auth:changed", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, [setCartCount]);

  // =========================
  // UPDATE QUANTITY
  // =========================
  const updateQty = async (itemId, change) => {
    const item = cartItems.find((i) => i.id === itemId);
    if (!item) return;

    const newQty = Math.max(1, item.quantity + change);

    await fetch(`http://localhost:8000/api/products/cart/item/${itemId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity: newQty }),
    });

    fetchCart();
  };

  // =========================
  // REMOVE ITEM
  // =========================
  const removeItem = async (itemId) => {
    await fetch(`http://localhost:8000/api/products/cart/item/${itemId}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchCart();
  };

  // =========================
  // TOTALS
  // =========================
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product_price * item.quantity,
    0
  );

  const tax = subtotal * taxRate;
  const total = subtotal + shipping + tax;

  // Helper to ensure image URL is absolute
  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("https")) {
      return url;
    }
    // Prepend backend URL if it's a relative path
    return `http://localhost:8000${url}`;
  };

  if (loading) {
    return <div className="text-center mt-20">Loading cart...</div>;
  }

  return (
    <>
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onOpenRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
        onAuthSuccess={() => {
          setIsLoginOpen(false);
          setToken(localStorage.getItem("access"));
          fetchCart();
        }}
      />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onOpenLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
      />

      <div
        className="relative min-h-screen"
        style={{
          backgroundImage: `url(${shopBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
      {/* ===== GRADIENT VEIL ===== */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(
              to bottom,
              rgba(249,246,241,0.95) 0%,
              rgba(249,246,241,0.85) 20%,
              rgba(249,246,241,0.6) 45%,
              rgba(249,246,241,0.35) 65%,
              rgba(249,246,241,0.15) 80%,
              rgba(249,246,241,0) 100%
            )
          `,
        }}
      />

      {/* ===== CONTENT ===== */}
      <div className="relative z-10 min-h-screen p-6 text-[#2f3e46]">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">
            Your Shopping Cart
          </h1>

          {cartItems.length === 0 ? (
            <p className="text-center text-gray-500">
              Your cart is empty.
            </p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ================= CART ITEMS ================= */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#faf0e6]/90 backdrop-blur-sm rounded-xl shadow-md p-4 grid grid-cols-4 items-center"
                  >
                    {/* Product */}
                    <div className="col-span-2 flex gap-4 items-center">
                      <img
                        src={getImageUrl(item.product_image)}
                        alt={item.product_name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-semibold">
                          {item.product_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          ${item.product_price}
                        </p>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="w-8 h-8 border rounded hover:bg-gray-100"
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="w-8 h-8 border rounded hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">
                        ${(item.product_price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* ================= ORDER SUMMARY ================= */}
              <div className="bg-[#faf0e6]/90 backdrop-blur-sm rounded-xl shadow p-6 h-fit">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                </div>

                <hr className="my-4" />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <button
                  onClick={() => setShowPayment(true)}
                  className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition transform hover:scale-105 shadow-lg"
                >
                  Pay with PayHere
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PAYMENT MODAL */}
      {showPayment && (
        <PayHerePayment
          cartItems={cartItems}
          totalAmount={total}
          subtotal={subtotal}
          tax={tax}
          shipping={shipping}
          authToken={token}
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            setCartItems([]);
            setCartCount(0);
            navigate("/customer/orders");
          }}
        />
      )}
    </div>
    </>
  );
};

export default Cart;
