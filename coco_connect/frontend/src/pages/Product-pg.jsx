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

const Product = () => {
  // ===================== FILTER STATES =====================
  const [filters, setFilters] = useState({
    category: "all",
    price: 500,
    type: "all",
    sortBy: "relevance",
  });

  const [visibleCount, setVisibleCount] = useState(6);

  // ===================== PRODUCT LIST =====================
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

  // ===================== NEWS ITEMS =====================
  const newsItems = [
    { text: " Introducing our NEW Eco-Friendly Coconut Sunscreen!", image: news1 },
    { text: " Buy 2 Coconut Oils and Get 1 Free - Limited Offer!", image: news2 },
    { text: " Free shipping on orders over $75!", image: news3 },
    { text: " Freshly harvested coir ropes just restocked!", image: news4 },
    { text: " Coconut Water now available in sparkling version!", image: news5 },
  ];

  const [newsIndex, setNewsIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setNewsIndex((prev) => (prev + 1) % newsItems.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // ====================== PRODUCT FILTER LOGIC ======================
  const filteredProducts = products
    .filter((p) => {
      const categoryMatch = filters.category === "all" || p.category === filters.category;
      const priceMatch = p.price <= filters.price;
      const typeMatch = filters.type === "all" || p.type === filters.type;
      return categoryMatch && priceMatch && typeMatch;
    })
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

  // ===================== MAIN UI =====================
  return (
    <div className="bg-[#f9f6f1] text-[#2f3e46] min-h-screen p-6">
      <div className="flex flex-col lg:flex-row gap-6">

        {/* ===================== SIDEBAR ===================== */}
        <div className="bg-[#faf0e6] w-full lg:w-1/4 p-6 rounded-lg shadow space-y-5">

          {/* CATEGORY */}
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

          {/* PRICE */}
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
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>$0</span>
              <span>$500</span>
            </div>
          </div>

          {/* PRODUCT TYPE */}
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

          {/* SORT */}
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

          {/* RESET */}
          <button onClick={handleReset} className="text-green-600 text-xs hover:underline">
            Reset Filters
          </button>

          {/* ===================== NEWS SLIDER ===================== */}
          <div className=" bg-[#a37241] text-white text-center rounded-lg shadow text-sm">

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

            <p className="mt-2 px-1">{newsItems[newsIndex].text}</p>
          </div>
        </div>

        {/* ===================== PRODUCT GRID ===================== */}
        <div className="w-full lg:w-3/4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleProducts.map((product) => (
              <div key={product.id} className="bg-[#faf0e6] rounded-xl shadow-md hover:shadow-xl transition p-4 relative">
                <span
                  className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full ${
                    product.stock === "In Stock"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {product.stock}
                </span>

                <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded" />

                <h3 className="font-semibold text-base mt-3">{product.name}</h3>
                <p className="text-xs text-gray-500">{product.description}</p>
                <p className="text-xs text-gray-400 mb-2">({product.reviews} reviews)</p>

                <div className="flex justify-between items-center">
                  <p className="font-semibold text-lg">${product.price.toFixed(2)}</p>
                  <button className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded">
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>

          {visibleCount < filteredProducts.length && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleLoadMore}
                className="px-5 py-2 border rounded-md hover:bg-gray-100 transition"
              >
                Load More Products
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Product;
