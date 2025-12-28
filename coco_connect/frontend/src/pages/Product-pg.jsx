import React, { useState, useEffect } from "react";

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

  const products = [
    { id: 1, name: "Premium Virgin Coconut Oil", image: prod1, price: 24.99, stock: "In Stock", description: "Organic, Cold-Pressed", reviews: 127, category: "oil", type: "Processed Goods" },
    { id: 2, name: "Fresh Coconut Water", image: prod2, price: 18.99, stock: "Low Stock", description: "100% Natural, 12-Pack", reviews: 156, category: "water", type: "Raw Materials" },
    { id: 3, name: "Natural Coir Fiber Rope", image: prod3, price: 45.0, stock: "In Stock", description: "Industrial Grade, 50m", reviews: 89, category: "fiber", type: "Equipment" },
    { id: 4, name: "Coconut Shell Bowl Set", image: prod4, price: 32.5, stock: "In Stock", description: "Handcrafted, Set of 4", reviews: 203, category: "fiber", type: "Processed Goods" },
    { id: 5, name: "Desiccated Coconut Powder", image: prod5, price: 20.0, stock: "In Stock", description: "Finely Grated, Dried", reviews: 97, category: "oil", type: "Processed Goods" },
    { id: 6, name: "Coconut Husk Mulch", image: prod6, price: 15.75, stock: "In Stock", description: "Perfect for gardening", reviews: 74, category: "fiber", type: "Raw Materials" },
    { id: 7, name: "Activated Coconut Biochar", image: prod7, price: 19.99, stock: "In Stock", description: "Soil Amendment, 1kg", reviews: 215, category: "fiber", type: "Processed Goods" },
    { id: 8, name: "Handcrafted Coconut Ladle Set", image: prod8, price: 19.99, stock: "In Stock", description: "Eco-Friendly, 3-Piece", reviews: 215, category: "fiber", type: "Equipment" },
    { id: 9, name: "Natural Coconut Shell Cups", image: prod9, price: 22.0, stock: "In Stock", description: "Polished Finish, Set of 2 Eco-Friendly Cups", reviews: 142, category: "fiber", type: "Processed Goods" },
  ];

  const newsItems = [
    { text: "Introducing our NEW Eco-Friendly Coconut Sunscreen!", image: news1 },
    { text: "Buy 2 Coconut Oils and Get 1 Free - Limited Offer!", image: news2 },
    { text: "Free shipping on orders over $75!", image: news3 },
    { text: "Freshly harvested coir ropes just restocked!", image: news4 },
    { text: "Coconut Water now available in sparkling version!", image: news5 },
  ];

  const [newsIndex, setNewsIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setNewsIndex((prev) => (prev + 1) % newsItems.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const filteredProducts = products
    .filter(
      (p) =>
        (filters.category === "all" || p.category === filters.category) &&
        p.price <= filters.price &&
        (filters.type === "all" || p.type === filters.type)
    )
    .sort((a, b) => {
      if (filters.sortBy === "price_low_high") return a.price - b.price;
      if (filters.sortBy === "price_high_low") return b.price - a.price;
      return 0;
    });

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 3, filteredProducts.length));
  };

  const handleReset = () => {
    setFilters({ category: "all", price: 500, type: "all", sortBy: "relevance" });
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
            {/* Category */}
            <div>
              <label className="font-semibold block mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="all">All (248)</option>
                <option value="oil">Coconut Oil (89)</option>
                <option value="fiber">Coir Fiber (56)</option>
                <option value="water">Coconut Water (34)</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="font-semibold block mb-2">
                Price Range (Up to ${filters.price})
              </label>
              <input
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

            {/* Sort */}
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
                {newsItems.map((item, index) => (
                  <img
                    key={index}
                    src={item.image}
                    alt="news"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                      newsIndex === index ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-2 px-2 text-center">{newsItems[newsIndex].text}</p>
            </div>
          </div>

          {/* PRODUCT GRID */}
          <div className="w-full lg:w-3/4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleProducts.map((product) => (
                <div key={product.id} className="bg-[#faf0e6] rounded-xl shadow-md hover:shadow-xl transition p-4 relative">
                  <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded" />
                  <h3 className="font-semibold mt-3">{product.name}</h3>
                  <p className="text-xs text-gray-500">{product.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="font-semibold">${product.price.toFixed(2)}</p>
                    <button className="bg-green-500 text-white px-3 py-1 rounded">Add</button>
                  </div>
                </div>
              ))}
            </div>

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
