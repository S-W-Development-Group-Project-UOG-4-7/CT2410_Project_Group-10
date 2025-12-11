import React, { useState } from "react";

// Importing product images
import prod1 from "../assets/coconut_oil.png";
import prod2 from "../assets/coconut_water.png";
import prod3 from "../assets/coir_rope.png";
import prod4 from "../assets/Coconut Shell Bowl Set.png";
import prod5 from "../assets/Desiccated Coconut Powder.png";
import prod6 from "../assets/Coconut Husk Mulch.png";
import prod7 from "../assets/Activated Coconut Biochar.png";
import prod8 from "../assets/Handcrafted Coconut Ladle Set.png";
import prod9 from "../assets/Natural Coconut Shell Cups.png";

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

  const filteredProducts = products
    .filter((p) => {
      const matchCategory =
        filters.category === "all" || p.category === filters.category;
      const matchPrice = p.price <= filters.price;
      const matchType =
        filters.type === "all" || p.type === filters.type;
      return matchCategory && matchPrice && matchType;
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

  return (
    <div className="bg-[#f9f6f1] text-[#2f3e46] min-h-screen p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* ===================== SIDEBAR ===================== */}
        <div className="w-full lg:w-1/4 bg-white p-6 rounded-lg shadow space-y-5">
          
          {/* CATEGORY SELECT */}
          <div>
            <label htmlFor="category" className="font-semibold block mb-2">
              Category
            </label>
            <select
              id="category"
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

          {/* PRICE RANGE */}
          <div>
            <label htmlFor="price" className="font-semibold block mb-2">
              Price Range (Up to ${filters.price})
            </label>
            <input
              id="price"
              type="range"
              min="0"
              max="500"
              value={filters.price}
              onChange={(e) => setFilters({ ...filters, price: Number(e.target.value) })}
              className="w-full accent-green-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>$0</span>
              <span>$500</span>
            </div>
          </div>

          {/* PRODUCT TYPE */}
          <div>
            <label htmlFor="type" className="font-semibold block mb-2">
              Product Type
            </label>
            <select
              id="type"
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

          {/* SORT BY */}
          <div>
            <label htmlFor="sortBy" className="font-semibold block mb-2">
              Sort By
            </label>
            <select
              id="sortBy"
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value="relevance">Relevance</option>
              <option value="price_low_high">Price: Low to High</option>
              <option value="price_high_low">Price: High to Low</option>
            </select>
          </div>

          {/* RESET BUTTON */}
          <button
            onClick={handleReset}
            className="text-green-600 text-xs hover:underline"
          >
            Reset Filters
          </button>
        </div>

        {/* ===================== PRODUCT GRID ===================== */}
        <div className="w-full lg:w-3/4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-4 relative"
              >
                <span
                  className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full ${
                    product.stock === "In Stock"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {product.stock}
                </span>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded"
                />
                <h3 className="font-semibold text-base mt-3">{product.name}</h3>
                <p className="text-xs text-gray-500">{product.description}</p>
                <p className="text-xs text-gray-400 mb-2">
                  ({product.reviews} reviews)
                </p>
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-lg">
                    ${product.price.toFixed(2)}
                  </p>
                  <button className="flex items-center bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded">
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* LOAD MORE */}
          {visibleCount < filteredProducts.length && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleLoadMore}
                className="px-5 py-2 border rounded-md hover:bg-gray-200 transition"
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
