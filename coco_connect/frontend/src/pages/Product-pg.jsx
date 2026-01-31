// src/pages/Product-pg.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import shopBg from "../assets/shopbg.png";
import shopheroBg from "../assets/cocoshopherobg.png";
import coconutImg from "../assets/FloatingCoco.png";
import { useCart } from "../context/CartContext";

import AddProductModal from "../components/AddProductModal";
import ProductDetailsModal from "../components/ProductDetailsModal";

// ✅ Use existing auth modals (no changes to other files)
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";

const API = "http://127.0.0.1:8000";
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_IMAGE_SIZE_MB = 5;

const Product = () => {
  const [filters, setFilters] = useState({
    category: "all",
    price: 500,
    type: "all",
    sortBy: "relevance",
  });

  const [visibleCount, setVisibleCount] = useState(6);

  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const [reloadProductsTick, setReloadProductsTick] = useState(0);

  // ✅ verify state
  const [verifyingId, setVerifyingId] = useState(null);
  const [verifyError, setVerifyError] = useState(null);

  const hasSetMaxPrice = useRef(false);

  // ✅ Logged-in user + access token (reactive)
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });
  const [access, setAccess] = useState(() => localStorage.getItem("access"));

  // Add Product modal
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isMyProductsOpen, setIsMyProductsOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);

  // ✅ Login gating popup + modals
  const [showLoginGate, setShowLoginGate] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // News
  const [newsItems, setNewsItems] = useState([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [newsIndex, setNewsIndex] = useState(0);

  const navigate = useNavigate();
  const productsSectionRef = useRef(null);

  // Product details modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // ✅ Helper: refresh auth state from localStorage
  const refreshAuth = () => {
    let u = null;
    try {
      u = JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      u = null;
    }
    setUser(u);
    setAccess(localStorage.getItem("access"));
  };

  // ✅ Helper: open Add Product (login-gated)
  const requestAddProduct = (e) => {
    if (e) e.stopPropagation();

    const token = localStorage.getItem("access");
    const u = (() => {
      try {
        return JSON.parse(localStorage.getItem("user") || "null");
      } catch {
        return null;
      }
    })();

    if (!token || !u) {
      setShowLoginGate(true);
      return;
    }

    setIsAddProductOpen(true);
  };

  useEffect(() => {
    if (!newsItems.length) return;
    const interval = setInterval(() => {
      setNewsIndex((prev) => (prev + 1) % newsItems.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [newsItems.length]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      setProductsError(null);

      let retryCount = 0;
      const maxRetries = 3;

      const attemptFetch = async () => {
        try {
          const response = await fetch(`${API}/api/products/`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });

          if (!response.ok) {
            let errDetail = null;
            try {
              const body = await response.json();
              errDetail = body.detail || JSON.stringify(body);
            } catch {
              errDetail = await response.text();
            }
            throw new Error(`Server returned ${response.status}: ${errDetail}`);
          }

          const data = await response.json();
          setProducts(Array.isArray(data) ? data : []);

          if (Array.isArray(data) && data.length > 0) {
            const maxPrice = Math.max(...data.map((p) => Number(p.price) || 0));
            if (!hasSetMaxPrice.current && maxPrice > filters.price) {
              setFilters((prev) => ({ ...prev, price: Math.ceil(maxPrice) }));
              hasSetMaxPrice.current = true;
            }
          }

          setIsLoadingProducts(false);
        } catch (err) {
          console.error(
            `❌ Error fetching products (attempt ${retryCount + 1}/${maxRetries}):`,
            err
          );

          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(attemptFetch, 1000);
          } else {
            setProducts([]);
            setProductsError(err.message || "Failed to fetch products");
            setIsLoadingProducts(false);
          }
        }
      };

      attemptFetch();
    };

    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadProductsTick]);

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoadingNews(true);
      try {
        const response = await fetch(`${API}/api/products/news/`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        setNewsItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Error fetching news:", err);
        setNewsItems([]);
      } finally {
        setIsLoadingNews(false);
      }
    };

    fetchNews();
  }, [reloadProductsTick]);

  // ✅ VERIFY handler
  const handleVerify = async (productId) => {
    setVerifyError(null);
    setVerifyingId(productId);

    try {
      const res = await fetch(`${API}/api/products/${productId}/verify/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(access ? { Authorization: `Bearer ${access}` } : {}),
        },
      });

      if (!res.ok) {
        let errDetail = null;
        try {
          const body = await res.json();
          errDetail = body.detail || body.error || JSON.stringify(body);
        } catch {
          errDetail = await res.text();
        }
        throw new Error(errDetail || `Verify failed (${res.status})`);
      }

      const updated = await res.json();

      // ✅ Keep hashes in state if backend returns them, but DON'T display them anywhere
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? {
                ...p,
                tx_hash: updated.tx_hash ?? p.tx_hash,
                product_hash: updated.product_hash ?? p.product_hash,
                verified_at: updated.verified_at ?? p.verified_at,
              }
            : p
        )
      );

      setSelectedProduct((prev) => {
        if (!prev || prev.id !== productId) return prev;
        return {
          ...prev,
          tx_hash: updated.tx_hash ?? prev.tx_hash,
          product_hash: updated.product_hash ?? prev.product_hash,
          verified_at: updated.verified_at ?? prev.verified_at,
        };
      });
    } catch (e) {
      console.error("❌ verify error:", e);
      setVerifyError(String(e.message || e));
    } finally {
      setVerifyingId(null);
    }
  };

  const { addToCart } = useCart();
  const handleAddToCart = async (productId) => addToCart(productId);

  // Categories from products
  const availableCategories = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) return [];
    const categories = new Set();
    products.forEach((p) => p?.category && categories.add(p.category));
    return Array.from(categories).sort();
  }, [products]);

  // Category counts based on filters except category
  const categoryCounts = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) return { all: 0 };

    const baseFiltered = products.filter((p) => {
      const price = Number(p?.price);
      if (Number.isNaN(price)) return false;
      return price <= filters.price && (filters.type === "all" || p.type === filters.type);
    });

    const counts = { all: baseFiltered.length };
    availableCategories.forEach((catSlug) => {
      counts[catSlug] = baseFiltered.filter((p) => p?.category === catSlug).length;
    });

    return counts;
  }, [products, filters.price, filters.type, availableCategories]);

  const categoryData = useMemo(() => {
    return {
      categories: availableCategories.map((slug, idx) => ({
        id: idx,
        slug,
        name: String(slug).replace(/-/g, " "),
        count: categoryCounts[slug] ?? 0,
      })),
    };
  }, [availableCategories, categoryCounts]);

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) return [];

    return products
      .filter((p) => {
        const price = Number(p?.price);
        if (Number.isNaN(price)) return false;

        return (
          (filters.category === "all" || p.category === filters.category) &&
          price <= filters.price &&
          (filters.type === "all" || p.type === filters.type)
        );
      })
      .sort((a, b) => {
        if (filters.sortBy === "price_low_high") return Number(a.price) - Number(b.price);
        if (filters.sortBy === "price_high_low") return Number(b.price) - Number(a.price);
        return 0;
      });
  }, [products, filters.category, filters.price, filters.type, filters.sortBy]);

  const visibleProducts = useMemo(() => filteredProducts.slice(0, visibleCount), [
    filteredProducts,
    visibleCount,
  ]);

  useEffect(() => {
    setVisibleCount(6);
  }, [filters.category, filters.price, filters.type, filters.sortBy]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 3, filteredProducts.length));
  };

  const handleReset = () => {
    setFilters({ category: "all", price: 500, type: "all", sortBy: "relevance" });
    setVisibleCount(6);
  };

  const openProduct = (product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

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
      {/* Fade overlay */}
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
      />

      {/* HERO */}
      <section
        className="relative w-full h-[70vh] flex items-center"
        style={{
          backgroundImage: `url(${shopheroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(
                to right,
                rgba(0,0,0,0.75) 10%,
                rgba(0,0,0,0.65) 30%,
                rgba(0,0,0,0.45) 45%,
                rgba(0,0,0,0.2) 60%,
                rgba(0,0,0,0) 75%
              )
            `,
          }}
        />
        {user && (
          <div className="absolute top-24 left-6 sm:left-10 z-20 flex flex-col gap-3">
            <button
              onClick={() => setIsMyProductsOpen(true)}
              className="px-4 py-2 rounded-md bg-white/90 text-green-800 font-semibold shadow hover:bg-white transition"
            >
              My Products
            </button>
            <button
              onClick={() => setIsOrdersOpen(true)}
              className="px-4 py-2 rounded-md bg-green-700 text-white font-semibold shadow hover:bg-green-800 transition"
            >
              Orders
            </button>
          </div>
        )}
        <div className="relative z-10 w-full px-6">
          <div className="max-w-xl ml-24 mt-20 text-white">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              <br />
              Shop Sustainable Products.
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white/90">
              Empowering farmers. Connecting investors. Delivering natural products.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() =>
                  productsSectionRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
                className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-md font-semibold transition"
              >
                Explore Products
              </button>
              <button
                onClick={() => navigate("/investment")}
                className="bg-white/90 text-green-700 hover:bg-white px-6 py-3 rounded-md font-semibold transition"
              >
                Invest in Lands
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <div ref={productsSectionRef} className="relative z-10 text-[#2f3e46] min-h-screen p-6">
        {/* TITLE */}
        <div className="relative z-10 text-center py-10">
          <h2 className="text-3xl font-semibold text-[#4b3b2a]">
            Sustainable Coconut Products
          </h2>
          <div className="w-24 h-[2px] bg-green-600 mx-auto mt-3"></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* SIDEBAR */}
          <div
            className="bg-[#faf0e6] w-full lg:w-1/4 p-6 rounded-lg shadow space-y-5
              lg:sticky lg:top-24
              max-h-[80vh] overflow-y-auto"
          >
            <div>
              <label className="font-semibold block mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="all">All</option>
                {categoryData.categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name} ({cat.count})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-2">
                Price Range (Up to ${filters.price})
              </label>
              <input
                type="range"
                min="0"
                max="100000"
                value={filters.price}
                onChange={(e) => setFilters({ ...filters, price: Number(e.target.value) })}
                className="w-full accent-green-400"
              />
            </div>

            <div>
              <label className="font-semibold block mb-2">Product Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="all">All</option>
                <option value="Raw Materials">Raw Materials</option>
                <option value="Processed Goods">Processed Goods</option>
                <option value="Equipment">Equipment</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="relevance">Relevance</option>
                <option value="price_low_high">Price: Low to High</option>
                <option value="price_high_low">Price: High to Low</option>
              </select>
            </div>

            <button onClick={handleReset} className="text-green-600 text-xs hover:underline">
              Reset Filters
            </button>

            {/* News slider */}
            <div className="bg-[#a37241] text-white rounded-lg shadow text-sm">
              <div className="relative w-full h-60 overflow-hidden rounded">
                {!isLoadingNews &&
                  newsItems.map((item, index) => (
                    <img
                      key={index}
                      src={
                        item.image?.startsWith("http")
                          ? item.image
                          : `${API}${item.image || ""}`
                      }
                      alt="news"
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                        newsIndex === index ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  ))}
              </div>
              <p className="mt-2 px-2 text-center">
                {newsItems.length ? newsItems[newsIndex]?.text : "Loading news..."}
              </p>
            </div>
          </div>

          {/* GRID */}
          <div className="w-full lg:w-3/4 pb-20">
            {isLoadingProducts ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading products...</p>
              </div>
            ) : (
              <>
                {productsError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-4">
                    <p className="font-semibold">Error loading products</p>
                    <p className="text-sm mt-1">{productsError}</p>
                    <div className="mt-3">
                      <button
                        onClick={() => {
                          setReloadProductsTick((t) => t + 1);
                          setIsLoadingProducts(true);
                          setProductsError(null);
                        }}
                        className="px-3 py-1 bg-green-600 text-white rounded"
                      >
                        Retry
                      </button>
                      <button
                        onClick={() => window.location.reload()}
                        className="ml-2 px-3 py-1 border rounded"
                      >
                        Reload page
                      </button>
                    </div>
                  </div>
                )}

                {verifyError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
                    <p className="text-sm">Verification failed: {verifyError}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visibleProducts.length > 0 ? (
                    visibleProducts.map((product) => {
                      const isVerified = Boolean(product?.verified_at);
                      const isVerifying = verifyingId === product.id;

                      const authorId = product?.author?.id ?? null;
                      const authorName = product?.author?.name ?? "Unknown";
                      const isOwner =
                        Boolean(user?.id && authorId) &&
                        Number(user.id) === Number(authorId);

                      const canVerify = Boolean(access && isOwner && !isVerified);

                      return (
                        <div
                          key={product.id}
                          onClick={() => openProduct(product)}
                          className="group bg-[#faf0e6] rounded-2xl shadow-md hover:shadow-xl transition p-4 relative cursor-pointer"
                        >
                          {/* Verified badge */}
                          {isVerified && (
                            <div className="absolute top-3 left-3 z-10">
                              <span className="text-[11px] bg-green-600 text-white px-2 py-1 rounded-full shadow">
                                ✔ Verified
                              </span>
                            </div>
                          )}

                          {/* Image */}
                          {product.image ? (
                            <div className="overflow-hidden rounded-xl">
                              <img
                                src={
                                  String(product.image).startsWith("http")
                                    ? product.image
                                    : `${API}${product.image}`
                                }
                                alt={product.name || "Product"}
                                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-full h-48 bg-gray-200 rounded-xl flex items-center justify-center">
                              <span className="text-gray-400">No Image</span>
                            </div>
                          )}

                          {/* Title & author */}
                          <div className="mt-3">
                            <h3 className="font-semibold text-[#3b2f24] group-hover:underline">
                              {product.name || "Unnamed Product"}
                            </h3>

                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-green-700">By {authorName}</p>

                              {/* ✅ Plus is ALWAYS visible */}
                              <button
                                onClick={(e) => requestAddProduct(e)}
                                className="text-green-600 font-bold hover:scale-110 transition"
                                title="Add your product"
                              >
                                +
                              </button>
                            </div>

                            <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                              {product.description || ""}
                            </p>

                            <div className="flex justify-between items-center mt-3">
                              <p className="font-semibold text-[#2f3e46]">
                                ${Number(product.price || 0).toFixed(2)}
                              </p>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(product.id);
                                }}
                                className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition"
                              >
                                Add
                              </button>
                            </div>

                            {/* Verify button */}
                            {canVerify && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVerify(product.id);
                                }}
                                disabled={isVerifying}
                                className={`mt-3 w-full px-3 py-2 rounded-xl font-semibold transition ${
                                  isVerifying
                                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                    : "bg-black text-white hover:bg-gray-900"
                                }`}
                              >
                                {isVerifying ? "Confirming..." : "Confirm Authenticity"}
                              </button>
                            )}

                            {user && !isOwner && !isVerified && (
                              <p className="mt-3 text-[11px] text-gray-500 text-center">
                                Only the owner can confirm authenticity
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-gray-500">
                        No products found. Try adjusting your filters.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {visibleCount < filteredProducts.length && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  className="px-5 py-2 border bg-[#faf0e6] rounded-md hover:bg-gray-100"
                >
                  Load More Products
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Floating Add Product Button (ALWAYS visible) */}
      <button
        onClick={(e) => requestAddProduct(e)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-green-600 text-white text-3xl
          font-bold flex items-center justify-center shadow-lg hover:bg-green-700 hover:scale-105
          transition z-50"
        title="Add your product"
      >
        +
      </button>



      {/* ✅ Custom popup (only when not logged in) */}
      {showLoginGate && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowLoginGate(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-[92%] max-w-sm rounded-2xl bg-white shadow-xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[#2f3e46]">Login required</h3>
            <p className="mt-2 text-sm text-gray-600">
              You need to login first to add your product.
            </p>

            <div className="mt-4 flex gap-2 justify-end">
              <button
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                onClick={() => setShowLoginGate(false)}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                onClick={() => {
                  // ✅ Save current page so after login it returns here (shop page / whatever page)
                  localStorage.setItem(
                    "redirectAfterLogin",
                    window.location.pathname + window.location.search
                  );

                  setShowLoginGate(false);
                  setIsLoginOpen(true);
                }}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}

      <MyProductsModal
        isOpen={isMyProductsOpen}
        onClose={() => setIsMyProductsOpen(false)}
        user={user}
        access={access}
        apiBase={API}
        onUpdated={() => setReloadProductsTick((t) => t + 1)}
      />

      <SellerOrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        access={access}
        apiBase={API}
      />

      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onSuccess={() => setReloadProductsTick((t) => t + 1)}
      />

      <ProductDetailsModal
        isOpen={isProductModalOpen}
        product={selectedProduct}
        API={API}
        user={user}
        access={access}
        verifyingId={verifyingId}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProduct(null);
        }}
        onAddToCart={(id) => handleAddToCart(id)}
        onVerify={(id) => handleVerify(id)}
      />

      {/* ✅ Login/Register modals (opens from the popup) */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onOpenRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
        onAuthSuccess={() => {
          refreshAuth();
          setIsLoginOpen(false);
        }}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onOpenLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
        onAuthSuccess={() => {
          refreshAuth();
          setIsRegisterOpen(false);
        }}
      />
    </div>
  );
};

const MyProductsModal = ({ isOpen, onClose, user, access, apiBase, onUpdated }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showCrack, setShowCrack] = useState(false);
  const crackTimerRef = useRef(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    type: "",
    image: null,
  });

  useEffect(() => {
    if (!isOpen) {
      setItems([]);
      setError("");
      setCategories([]);
      setEditId(null);
      setSaving(false);
      setShowCrack(false);
      if (crackTimerRef.current) {
        clearTimeout(crackTimerRef.current);
        crackTimerRef.current = null;
      }
      setForm({
        name: "",
        description: "",
        price: "",
        category: "",
        type: "",
        image: null,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (crackTimerRef.current) {
        clearTimeout(crackTimerRef.current);
        crackTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const fetchAll = async () => {
      setLoading(true);
      setError("");
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch(`${apiBase}/api/products/`, {
            headers: { "Content-Type": "application/json" },
          }),
          fetch(`${apiBase}/api/products/categories/`, {
            headers: { "Content-Type": "application/json" },
          }),
        ]);

        if (!productsRes.ok) throw new Error("Failed to load products.");
        const productsData = await productsRes.json();
        setItems(Array.isArray(productsData) ? productsData : []);

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        } else {
          setCategories([]);
        }
      } catch (e) {
        setError(String(e.message || e));
        setItems([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [isOpen, apiBase]);

  const myProducts = useMemo(() => {
    if (!user?.id) return [];
    return items.filter((p) => Number(p?.author?.id) === Number(user.id));
  }, [items, user]);

  const startEdit = (product) => {
    setEditId(product.id);
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      category: product.category || "",
      type: product.type || "",
      image: null,
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setSaving(false);
    setForm({
      name: "",
      description: "",
      price: "",
      category: "",
      type: "",
      image: null,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editId) return;

    if (!access) {
      setError("Please login to update your products.");
      return;
    }

    if (form.name.trim().length < 3) {
      setError("Product name must be at least 3 characters long.");
      return;
    }
    if (form.description.trim().length < 10) {
      setError("Description must be at least 10 characters long.");
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      setError("Price is required and must be greater than 0.");
      return;
    }
    if (!form.category) {
      setError("Category is required.");
      return;
    }
    if (!form.type) {
      setError("Product type is required.");
      return;
    }

    setSaving(true);
    setError("");
    setShowCrack(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("type", form.type);
      if (form.image) formData.append("image", form.image);

      const res = await fetch(`${apiBase}/api/products/${editId}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${access}`,
        },
        body: formData,
      });

      if (res.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        throw new Error("Session expired. Please login again.");
      }

      if (!res.ok) {
        let errDetail = null;
        try {
          const body = await res.json();
          errDetail = body.detail || body.error || JSON.stringify(body);
        } catch {
          errDetail = await res.text();
        }
        const safeMsg =
          errDetail && String(errDetail).toLowerCase().includes("token")
            ? "Session expired. Please login again."
            : errDetail || "Failed to update product.";
        throw new Error(safeMsg);
      }

      toast.success("Product updated successfully.");
      cancelEdit();
      onUpdated?.();
      if (isOpen) {
        const fresh = await fetch(`${apiBase}/api/products/`, {
          headers: { "Content-Type": "application/json" },
        });
        if (fresh.ok) {
          const data = await fresh.json();
          setItems(Array.isArray(data) ? data : []);
        }
      }
      if (crackTimerRef.current) clearTimeout(crackTimerRef.current);
      crackTimerRef.current = setTimeout(() => setShowCrack(false), 900);
    } catch (e) {
      setError(String(e.message || e));
      setShowCrack(false);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative w-full max-w-5xl bg-[#fffaf3] rounded-2xl shadow-2xl overflow-hidden border border-black/10">
        {showCrack && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70">
            <div className="relative w-40 h-40">
              <div className="absolute left-0 top-0 h-full w-1/2 overflow-hidden">
                <img
                  src={coconutImg}
                  alt="coconut"
                  className="absolute left-0 top-0 h-full w-auto object-cover crack-left"
                />
              </div>
              <div className="absolute right-0 top-0 h-full w-1/2 overflow-hidden">
                <img
                  src={coconutImg}
                  alt="coconut"
                  className="absolute right-0 top-0 h-full w-auto object-cover crack-right"
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-semibold text-black">Updating...</span>
              </div>
            </div>
          </div>
        )}
        <style>{`
          @keyframes crackLeft {
            0% { transform: translateX(0) rotate(0deg) scale(1); }
            60% { transform: translateX(-8px) rotate(-6deg) scale(1.02); }
            100% { transform: translateX(-16px) rotate(-10deg) scale(1.02); }
          }
          @keyframes crackRight {
            0% { transform: translateX(0) rotate(0deg) scale(1); }
            60% { transform: translateX(8px) rotate(6deg) scale(1.02); }
            100% { transform: translateX(16px) rotate(10deg) scale(1.02); }
          }
          .crack-left { animation: crackLeft 0.9s ease-in-out forwards; }
          .crack-right { animation: crackRight 0.9s ease-in-out forwards; }
        `}</style>
        <div className="flex items-center justify-between p-5 border-b border-black/10 bg-white/70">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#2b221a]">My Products</h2>
            <p className="text-sm text-green-800 mt-1">
              Manage products you created
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-red-600 border border-red-700 hover:bg-red-700 transition flex items-center justify-center text-white"
            aria-label="Close"
            title="Close"
          >
            <span className="text-xl leading-none">x</span>
          </button>
        </div>

        <div className="p-5 space-y-6 max-h-[75vh] overflow-y-auto">
          {!user && (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
              Please login to view your products.
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center text-slate-800">Loading your products...</div>
          ) : myProducts.length === 0 ? (
            <div className="text-center text-slate-800">You have no products yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 text-sm text-black">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myProducts.map((p) => (
                    <tr key={p.id} className="border-t hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-10 h-10 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-100 grid place-items-center font-bold text-slate-700">
                              {String(p.name || "P").slice(0, 1).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-black">{p.name}</div>
                            <div className="text-xs text-slate-800 line-clamp-1">
                              {p.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-black">
                        {String(p.category || "-").replace(/-/g, " ")}
                      </td>
                      <td className="px-4 py-3 text-black">{p.type || "-"}</td>
                      <td className="px-4 py-3 font-semibold text-black">
                        LKR {Number(p.price || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => startEdit(p)}
                          className="text-green-700 font-semibold hover:underline"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {editId && (
            <form
              onSubmit={handleSave}
              className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4"
            >
              <h3 className="text-lg font-semibold text-slate-900">Update Product</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg px-4 py-3 border border-slate-300 text-black placeholder-black/50"
                  placeholder="Product name"
                  required
                />

                <input
                  type="text"
                  inputMode="decimal"
                  value={form.price}
                  onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                  className="w-full rounded-lg px-4 py-3 border border-slate-300 text-black placeholder-black/50"
                  placeholder="Price"
                  required
                />
              </div>

              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full rounded-lg px-4 py-3 border border-slate-300 text-black placeholder-black/50"
                placeholder="Product description"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded-lg px-4 py-3 border border-slate-300 text-black"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                <select
                  value={form.type}
                  onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                  className="w-full rounded-lg px-4 py-3 border border-slate-300 text-black"
                  required
                >
                  <option value="">Select Product Type</option>
                  <option value="Raw Materials">Raw Materials</option>
                  <option value="Processed Goods">Processed Goods</option>
                  <option value="Equipment">Equipment</option>
                </select>
              </div>

              <input
                type="file"
                className="text-sm text-black"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                    setError("Only JPG, PNG, and WEBP images are allowed.");
                    e.target.value = "";
                    return;
                  }
                  const sizeMB = file.size / (1024 * 1024);
                  if (sizeMB > MAX_IMAGE_SIZE_MB) {
                    setError("Image size must be under 5MB.");
                    e.target.value = "";
                    return;
                  }
                  setForm((prev) => ({ ...prev, image: file }));
                }}
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-5 py-2 rounded-lg border border-slate-300 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-6 py-2 rounded-lg text-white font-semibold ${
                    saving ? "bg-slate-400" : "bg-green-700 hover:bg-green-800"
                  }`}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const SellerOrdersModal = ({ isOpen, onClose, access, apiBase }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [supplyingId, setSupplyingId] = useState(null);

  const fetchOrders = async () => {
    if (!access) {
      setError("Please login to view your orders.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiBase}/api/products/seller-orders/`, {
        headers: { Authorization: `Bearer ${access}` },
      });
      if (!res.ok) throw new Error("Failed to load orders.");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(String(e.message || e));
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchOrders();
  }, [isOpen]);

  const handleSupply = async (itemId) => {
    if (!access) {
      setError("Please login to supply orders.");
      return;
    }
    setSupplyingId(itemId);
    setError("");
    try {
      const res = await fetch(
        `${apiBase}/api/products/seller-orders/${itemId}/supply/`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${access}` },
        }
      );
      if (!res.ok) {
        let errDetail = null;
        try {
          const body = await res.json();
          errDetail = body.detail || body.error || JSON.stringify(body);
        } catch {
          errDetail = await res.text();
        }
        throw new Error(errDetail || "Failed to update item.");
      }
      const updated = await res.json();
      setItems((prev) =>
        prev.map((it) =>
          it.id === itemId
            ? { ...it, supplied: updated.supplied, supplied_at: updated.supplied_at }
            : it
        )
      );
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setSupplyingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative w-full max-w-5xl bg-[#fffaf3] rounded-2xl shadow-2xl overflow-hidden border border-black/10">
        <div className="flex items-center justify-between p-5 border-b border-black/10 bg-white/70">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#2b221a]">Orders</h2>
            <p className="text-sm text-green-800 mt-1">
              New orders for your products
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchOrders}
              className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-white"
            >
              Refresh
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-red-600 border border-red-700 hover:bg-red-700 transition flex items-center justify-center text-white"
              aria-label="Close"
              title="Close"
            >
              <span className="text-xl leading-none">x</span>
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center text-gray-600">Loading orders...</div>
          ) : items.length === 0 ? (
            <div className="text-center text-gray-600">No orders yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 text-sm text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Buyer</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-t hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium">#{item.order_id}</td>
                      <td className="px-4 py-3">{item.product_name}</td>
                      <td className="px-4 py-3">{item.quantity}</td>
                      <td className="px-4 py-3">{item.buyer_email}</td>
                      <td className="px-4 py-3">
                        LKR {Number(item.line_total || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        {item.supplied ? (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            Supplied
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          disabled={item.supplied || supplyingId === item.id}
                          onClick={() => handleSupply(item.id)}
                          className={`px-3 py-1 rounded-md text-sm font-semibold ${
                            item.supplied
                              ? "bg-slate-200 text-slate-600 cursor-not-allowed"
                              : "bg-green-700 text-white hover:bg-green-800"
                          }`}
                        >
                          {supplyingId === item.id
                            ? "Updating..."
                            : item.supplied
                            ? "Supplied"
                            : "Mark Supplied"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Product;
