import React, { useState, useEffect, useMemo } from "react";

// Product images
import prod1 from "../assets/coconut_oil.png";
import prod2 from "../assets/coconut_water.png";
import prod3 from "../assets/coir_rope.png";
import prod4 from "../assets/Coconut Shell Bowl Set.png";
import prod5 from "../assets/Desiccated Coconut Powder.png";
import prod6 from "../assets/Coconut Husk Mulch.png";
import prod7 from "../assets/Activated Coconut Biochar.png";
import prod8 from "../assets/Handcrafted Coconut Ladle Set.png";
import prod9 from "../assets/Natural Coconut Shell Cups.png";

// News images
import news1 from "../assets/news1.png";
import news2 from "../assets/news2.png";
import news3 from "../assets/news3.png";
import news4 from "../assets/news4.png";
import news5 from "../assets/news5.png";

// Background images
import shopBg from "../assets/shopbg.png";
import shopheroBg from "../assets/cocoshopherobg.png";


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

const [newsItems, setNewsItems] = useState([]);
const [isLoadingNews, setIsLoadingNews] = useState(true);


  const [newsIndex, setNewsIndex] = useState(0);

useEffect(() => {
  if (!newsItems.length) return; // ✅ prevent crash when empty

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
        const response = await fetch("http://127.0.0.1:8000/api/products/", {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          // try to get server-provided detail
          let errDetail = null;
          try {
            const body = await response.json();
            errDetail = body.detail || JSON.stringify(body);
          } catch (e) {
            errDetail = await response.text();
          }
          const msg = `Server returned ${response.status}: ${errDetail}`;
          throw new Error(msg);
        }
        
        const data = await response.json();
        console.log("✅ API PRODUCTS:", data);
        console.log("✅ Number of products:", Array.isArray(data) ? data.length : 0);
        
        if (Array.isArray(data) && data.length > 0) {
          console.log("✅ Sample product:", data[0]);
          console.log("✅ Product structure:", {
            id: data[0].id,
            name: data[0].name,
            category: data[0].category,
            type: data[0].type,
            price: data[0].price,
            image: data[0].image
          });
        }
        
        setProducts(Array.isArray(data) ? data : []);
        setIsLoadingProducts(false);
      } catch (err) {
        console.error(`❌ Error fetching products (attempt ${retryCount + 1}/${maxRetries}):`, err);
        
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`🔄 Retrying in 1 second...`);
          setTimeout(attemptFetch, 1000);
        } else {
          console.error("❌ Failed to fetch products after all retries");
          setProducts([]);
          setProductsError(err.message || 'Failed to fetch products');
          setIsLoadingProducts(false);
        }
      }
    };
    
    attemptFetch();
  };
  
  fetchProducts();
}, [reloadProductsTick]);

useEffect(() => {
  const fetchNews = async () => {
    setIsLoadingNews(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/products/news/", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("✅ API NEWS:", data);
      setNewsItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error fetching news:", err);
      setNewsItems([]);
    } finally {
      setIsLoadingNews(false);
    }
  };
  
  fetchNews();
}, []);


// Get all unique categories from products dynamically
const availableCategories = useMemo(() => {
  if (!Array.isArray(products) || products.length === 0) {
    return [];
  }
  const categories = new Set();
  products.forEach(p => {
    if (p?.category) {
      categories.add(p.category);
    }
  });
  return Array.from(categories).sort();
}, [products]);

// Calculate category counts based on current filters (price and type, but not category)
// This updates in real-time when price or type filters change
const categoryCounts = useMemo(() => {
  // Safety check: ensure products is an array
  if (!Array.isArray(products) || products.length === 0) {
    return { all: 0 };
  }
  
  // Filter products by price and type (excluding category filter)
  // Note: API returns 'type' field, not 'product_type'
  // Backend: Product.category (ForeignKey) → Category.slug → serializer returns as 'category' (slug string)
  // Backend: Product.product_type (ForeignKey) → ProductType.name → serializer returns as 'type' (name string)
  const baseFiltered = products.filter((p) => {
    if (!p || typeof p !== 'object') return false;
    const price = Number(p.price);
    if (isNaN(price)) return false;
    
    return price <= filters.price &&
      (
        filters.type === "all" ||
        p.type === filters.type
      );
  });
  
  // Build dynamic category counts
  const counts = { all: baseFiltered.length };
  availableCategories.forEach(catSlug => {
    counts[catSlug] = baseFiltered.filter(p => p?.category === catSlug).length;
  });
  
  return counts;
}, [products, filters.price, filters.type, availableCategories]);

// Build category data for the UI (was previously missing as `categoryData`)
const categoryData = useMemo(() => {
  // availableCategories is an array of category slugs
  return {
    categories: availableCategories.map((slug, idx) => ({
      id: idx,
      slug,
      // Display a nicer name by replacing dashes with spaces; fallback to slug
      name: String(slug).replace(/-/g, " "),
      count: categoryCounts[slug] ?? 0,
    })),
  };
}, [availableCategories, categoryCounts]);

const filteredProducts = useMemo(() => {
  if (!Array.isArray(products) || products.length === 0) {
    return [];
  }
  
  return products
    .filter((p) => {
      if (!p || typeof p !== 'object') return false;
      const price = Number(p.price);
      if (isNaN(price)) return false;
      
      // Note: API returns 'type' field, not 'product_type'
      return (
        (filters.category === "all" || p.category === filters.category) &&
        price <= filters.price &&
        (
          filters.type === "all" ||
          p.type === filters.type
        )
      );
    })
    .sort((a, b) => {
      if (filters.sortBy === "price_low_high") return Number(a.price) - Number(b.price);
      if (filters.sortBy === "price_high_low") return Number(b.price) - Number(a.price);
      return 0;
    });
}, [products, filters.category, filters.price, filters.type, filters.sortBy]);


  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  // Reset visible count when filters change
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
></div>


{/* ================= HERO SECTION ================= */}
<section
  className="relative w-full h-[70vh] flex items-center"
  style={{
    backgroundImage: `url(${shopheroBg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>
  {/* Left-focused gradient */}
  
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
  ></div>
{/* Content */}
<div className="relative z-10 w-full px-6">
    <div className="max-w-xl ml-24 mt-20 text-white">

      <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6"><br />
        Shop Sustainable Products.
      </h1>

      <p className="text-lg md:text-xl mb-8 text-white/90">
        Empowering farmers. Connecting investors. Delivering natural products.
      </p>

      <div className="flex gap-4">
        <button className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-md font-semibold transition">
          Explore Products
        </button>
        <button className="bg-white/90 text-green-700 hover:bg-white px-6 py-3 rounded-md font-semibold transition">
          Invest in Lands
        </button>
      </div>

    </div>
  </div>
</section>

      {/* ORIGINAL UI */}
      
      <div className="relative z-10 text-[#2f3e46] min-h-screen p-6">
         {/* SECTION TITLE */}
  <div className="relative z-10 text-center py-10">
    <h2 className="text-3xl font-semibold text-[#4b3b2a]">
      Sustainable Coconut Products
    </h2>
    <div className="w-24 h-[2px] bg-green-600 mx-auto mt-3"></div>
  </div>
        <div className="flex flex-col lg:flex-row gap-6">
          

          {/* SIDEBAR */}
          <div className="bg-[#faf0e6] w-full lg:w-1/4 p-6 rounded-lg shadow space-y-5">
<div>
    <label htmlFor="type-filter" className="font-semibold block mb-2"> Category </label>
  <select
  value={filters.category}
  onChange={(e) =>
    setFilters({ ...filters, category: e.target.value })
  }
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

            {/* Price */}
            <div>
              <label htmlFor="price-filter" className="font-semibold block mb-2">
                Price Range (Up to ${filters.price})
              </label>
              <input
                id="price-filter"
                name="price-filter"
                type="range"
                min="0"
                max="500"
                value={filters.price}
                onChange={(e) => setFilters({ ...filters, price: Number(e.target.value) })}
                className="w-full accent-green-400"
              />
            </div>

            {/* Product Type */}
            <div>
              <label htmlFor="type-filter" className="font-semibold block mb-2">Product Type</label>
              <select
                id="type-filter"
                name="type-filter"
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

            {/* Sort */}
            <div>
              <label htmlFor="sort-filter" className="font-semibold block mb-2">Sort By</label>
              <select
                id="sort-filter"
                name="sort-filter"
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
                {newsItems.map((item, index) => (
                  <img
                    key={index}
                    src={item.image?.startsWith('http') ? item.image : `http://127.0.0.1:8000${item.image || ''}`}
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

          {/* PRODUCT GRID */}
          <div className="w-full lg:w-3/4">
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
                      <button onClick={() => { setReloadProductsTick(t => t + 1); setIsLoadingProducts(true); setProductsError(null); }}
                        className="px-3 py-1 bg-green-600 text-white rounded">
                        Retry
                      </button>
                      <button onClick={() => window.location.reload()} className="ml-2 px-3 py-1 border rounded">Reload page</button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"> 

                {visibleProducts.length > 0 ? (
                  visibleProducts.map((product) => (
                    <div key={product.id} className="bg-[#faf0e6] rounded-xl shadow-md hover:shadow-xl transition p-4 relative">
                      {product.image ? (
                        <img
                          src={product.image.startsWith('http') ? product.image : `http://127.0.0.1:8000${product.image}`}
                          alt={product.name || 'Product'}
                          className="w-full h-48 object-cover rounded"
                          onError={(e) => {
                            console.error("Image load error for product:", product.id, product.image);
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}
                      <h3 className="font-semibold mt-3">{product.name || 'Unnamed Product'}</h3>
                      <p className="text-xs text-gray-400">By {product.author || 'Unknown'}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{product.description || ''}</p>
                      <div className="flex justify-between items-center mt-2">
                        <p className="font-semibold">${Number(product.price || 0).toFixed(2)}</p>
                        <button className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition">Add</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500">No products found. Try adjusting your filters.</p>
                    {products.length > 0 && (
                      <p className="text-sm text-gray-400 mt-2">
                        {products.length} total products available, but none match your current filters.
                      </p>
                    )}
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
    </div>
  );
};

export default Product;
