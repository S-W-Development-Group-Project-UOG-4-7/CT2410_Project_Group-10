// src/pages/Product-pg.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";

import shopBg from "../assets/shopbg.png";
import shopheroBg from "../assets/cocoshopherobg.png";
import { useCart } from "../context/CartContext";

import AddProductModal from "../components/AddProductModal";
import ProductDetailsModal from "../components/ProductDetailsModal";

const API = "http://127.0.0.1:8000";

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

  // ✅ Logged-in user (null if not logged in)
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);
  const access = localStorage.getItem("access");

  // Add Product modal
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // News
  const [newsItems, setNewsItems] = useState([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [newsIndex, setNewsIndex] = useState(0);

  const navigate = useNavigate();
  const productsSectionRef = useRef(null);

  // Product details modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

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

                              {user && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsAddProductOpen(true);
                                  }}
                                  className="text-green-600 font-bold hover:scale-110 transition"
                                  title="Add your product"
                                >
                                  +
                                </button>
                              )}
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

      {/* Floating Add Product Button */}
      {user && (
        <button
          onClick={() => setIsAddProductOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-green-600 text-white text-3xl
            font-bold flex items-center justify-center shadow-lg hover:bg-green-700 hover:scale-105
            transition z-50"
          title="Add your product"
        >
          +
        </button>
      )}

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
    </div>
  );
};

export default Product;
