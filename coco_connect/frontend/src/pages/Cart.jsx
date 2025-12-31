import React, { useState } from "react";

// Product images
import prod1 from "../assets/coconut_oil.png";
import prod3 from "../assets/coir_rope.png";
import prod4 from "../assets/Coconut Shell Bowl Set.png";

// Background image
import shopBg from "../assets/shopbg.png";

const Cart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Premium Virgin Coconut Oil",
      image: prod1,
      price: 24.99,
      qty: 1,
      stock: "In Stock",
    },
    {
      id: 2,
      name: "Natural Coir Fiber Rope",
      image: prod3,
      price: 45.0,
      qty: 2,
      stock: "In Stock",
    },
    {
      id: 3,
      name: "Coconut Shell Bowl Set",
      image: prod4,
      price: 32.5,
      qty: 1,
      stock: "In Stock",
    },
  ]);

  const shipping = 12;
  const taxRate = 0.08;

  const updateQty = (id, change) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, qty: Math.max(1, item.qty + change) }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const tax = subtotal * taxRate;
  const total = subtotal + shipping + tax;

  return (
    <div
      className="relative min-h-screen"
      style={{
        backgroundImage: `url(${shopBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* ===== GRADIENT VEIL (SAME AS SHOP PAGE) ===== */}
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
            ),
            radial-gradient(
              ellipse at center,
              rgba(249,246,241,0.75) 0%,
              rgba(249,246,241,0.55) 35%,
              rgba(249,246,241,0.25) 60%,
              rgba(249,246,241,0) 85%
            )
          `,
        }}
      ></div>

      {/* ===== CONTENT ===== */}
      <div className="relative z-10 min-h-screen p-6 text-[#2f3e46]">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">
            Your Shopping Cart
          </h1>

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
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-500">${item.price}</p>
                      <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        {item.stock}
                      </span>
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
                    <span>{item.qty}</span>
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
                      ${(item.price * item.qty).toFixed(2)}
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

              {/* COUPON */}
              <div className="bg-[#faf0e6]/90 backdrop-blur-sm p-4 rounded-xl shadow">
                <h4 className="font-semibold mb-2">Have a Coupon Code?</h4>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    className="flex-1 border rounded px-3 py-2"
                  />
                  <button className="border px-4 py-2 rounded hover:bg-gray-100">
                    Apply
                  </button>
                </div>
              </div>
            </div>

            {/* ================= ORDER SUMMARY ================= */}
            <div className="bg-[#faf0e6]/90 backdrop-blur-sm rounded-xl shadow p-6 h-fit">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal ({cartItems.length} items)</span>
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

              <button className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded font-semibold">
                Proceed to Checkout
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                🔒 Secure Checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
