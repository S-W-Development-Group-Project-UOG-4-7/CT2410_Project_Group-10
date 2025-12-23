import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const cartItemCount = 3; // Replace this with actual cart logic or prop

  const toggleMobileMenu = () => {
    setIsMobileOpen((prev) => !prev);
  };

  return (
    <header className="bg-accent4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo Section */}
          <div className="flex items-center">
            <img
              src="/tree.png"
              alt="Cococonnect Logo"
              className="w-14 h-auto mr-3"
            />
            <div className="logo-text">
              <span className="coco-text">COCO</span>
              <span className="connect-text">CONNECT</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 text-sm lg:text-base">
            <Link to="/" className="font-bold text-accent2 hover:text-[#4caf50]">Home</Link>
            <Link to="/about" className="font-bold text-accent2 hover:text-[#4caf50]">About Us</Link>
            <Link to="/shop" className="font-bold text-accent2 hover:text-[#4caf50]">Shop</Link>
            <Link to="/ideas" className="font-bold text-accent2 hover:text-[#4caf50]">Idea Sharing</Link>
            <Link to="/news" className="font-bold text-accent2 hover:text-[#4caf50]">News Corner</Link>
          </nav>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">

            {/* Language Dropdown */}
            <div className="relative group">
              <button className="flex items-center text-accent2 hover:text-[#4caf50] transition-colors">
                <i className="fa-solid fa-earth-asia ml-2 text-xl" />
              </button>
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg py-1 hidden group-hover:block z-50">
                <a href="#" className="block px-4 py-2 font-bold text-accent2 hover:bg-accent5">English</a>
                <a href="#" className="block px-4 py-2 font-bold text-accent2 hover:bg-accent5">සිංහල</a>
                <a href="#" className="block px-4 py-2 font-bold text-accent2 hover:bg-accent5">日本語</a>
              </div>
            </div>

            {/* Search Icon + Input */}
            <div className="relative group">
              <i className="fa-solid fa-magnifying-glass text-2xl text-accent2 group-hover:text-[#4caf50] cursor-pointer" />
              <input
                type="text"
                placeholder="Search..."
                className="absolute top-1/2 -translate-y-1/2 right-0 w-0 group-hover:w-40 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white text-accent6 border border-accent3 rounded-md px-2 py-1"
              />
            </div>

            {/* Cart Icon */}
            <Link to="/cart" className="relative text-accent2 hover:text-[#4caf50] transition-colors">
              <i className="fa-solid fa-cart-shopping text-xl" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Login Icon */}
            <Link to="/login" className="text-accent2 hover:text-secondary transition-colors">
              <i className="fa-regular fa-user text-xl" />
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden text-accent2 hover:text-secondary"
            >
              <i className="fas fa-bars text-xl" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileOpen && (
          <div className="md:hidden py-4 border-t border-accent5 bg-accent4">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="font-semibold text-accent2 hover:text-secondary">Home</Link>
              <Link to="/about" className="font-medium text-accent2 hover:text-primary">About Us</Link>
              <Link to="/shop" className="font-semibold text-accent2 hover:text-secondary">Shop</Link>
              <Link to="/ideas" className="font-medium text-accent2 hover:text-primary">Idea Sharing</Link>
              <Link to="/news" className="font-medium text-accent2 hover:text-primary">News Corner</Link>
              <Link to="/cart" className="font-medium text-accent2 hover:text-primary">Cart</Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
