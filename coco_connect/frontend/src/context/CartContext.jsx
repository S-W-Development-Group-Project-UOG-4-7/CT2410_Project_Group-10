import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";

const CartContext = createContext();

const API_BASE = "http://127.0.0.1:8000/api/products";

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Always read latest token
  const getToken = () => localStorage.getItem("access");

  // =========================
  // LOAD CART
  // =========================
  const loadCart = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setCartCount(0);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/cart/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        setCartCount(0);
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to load cart");
      }

      const data = await res.json();
      setCartCount(Number(data.total_items || 0));
    } catch (err) {
      console.error("Cart load failed:", err);
      setCartCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // =========================
  // ADD TO CART
  // =========================

  // ... existing imports

  // =========================
  // ADD TO CART
  // =========================
  const addToCart = async (productId) => {
    const token = getToken();

    if (!token) {
      toast.info("Please login to add items to cart 🔐");
      return;
    }

    try {
      // Corrected URL based on previous fixes
      const res = await fetch(`${API_BASE}/cart/add/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId }),
      });

      if (res.status === 401) {
        toast.error("Session expired. Please login again.");
        return;
      }

      if (!res.ok) {
        const errorData = await res.text(); // safe text parse first
        try {
          const jsonErr = JSON.parse(errorData);
          throw new Error(jsonErr.detail || jsonErr.error || "Failed to add items");
        } catch {
          throw new Error("Server error");
        }
      }

      const data = await res.json();
      setCartCount(Number(data.cart_count || 0));
      toast.success("Product added to cart 🛒");

    } catch (err) {
      console.error("Add to cart error:", err);
      toast.error(err.message || "Failed to add item");
    }
  };

  const value = useMemo(
    () => ({
      cartCount,
      setCartCount,
      loading,
      addToCart,
      loadCart,
    }),
    [cartCount, loading, addToCart, loadCart]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx;
};
