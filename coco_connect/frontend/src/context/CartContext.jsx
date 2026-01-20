import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";

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
  const addToCart = async (productId) => {
    const token = getToken();
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(`${API_BASE}/cart/add/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ product_id: productId }),
    });

    if (res.status === 401) {
      throw new Error("Unauthorized");
    }

    if (!res.ok) {
      throw new Error("Failed to add to cart");
    }

    const data = await res.json();
    setCartCount(Number(data.cart_count || 0));
  };

  const value = useMemo(
    () => ({
      cartCount,
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
