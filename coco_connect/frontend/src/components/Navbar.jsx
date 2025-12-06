import React, { useState } from "react";
import { Link } from "react-router-dom";
import LoginModal from "./LoginModal";

const Navbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false); // NEW

  const toggleMobileMenu = () => {
    setIsMobileOpen((prev) => !prev);
  };

  return (
    <>
      <header className="bg-accent4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo Section */}
            <div className="flex items-center">
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
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8 text-sm lg:text-base">
              <Link
                to="/"
                className="font-nunito font-bold text-accent2 hover:text-[#4caf50] transition-colors"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-accent2 font-bold hover:text-[#4caf50] transition-colors"
              >
                About Us
              </Link>
              <Link
                to="/shop"
                className="font-nunito font-bold text-accent2 hover:text-[#4caf50] transition-colors"
              >
                Shop
              </Link>
              <Link
                to="/ideas"
                className="text-accent2 font-bold hover:text-[#4caf50] transition-colors"
              >
                Idea Sharing
              </Link>
              <Link
                to="/news"
                className="text-accent2 font-bold hover:text-[#4caf50] transition-colors"
              >
                News Corner
              </Link>
            </nav>

            {/* Right Icons */}
            <div className="flex items-center space-x-4">
              {/* Language Dropdown */}
              <div className="relative group">
                <button className="flex items-center text-accent2 hover:text-[#4caf50] transition-colors">
                  <i className="fa-solid fa-earth-asia ml-2 text-xl" />
                </button>

                <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg py-1 hidden group-hover:block z-50">
                  <a
                    href="#"
                    className="block px-4 py-2 font-bold text-accent2 hover:bg-accent5 font-nunito"
                  >
                    English
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 font-bold text-accent2 hover:bg-accent5 font-nunito"
                  >
                    සිංහල
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 font-bold text-accent2 hover:bg-accent5 font-nunito"
                  >
                    日本語
                  </a>
                </div>
              </div>

              {/* Search Icon + Hover Search Bar */}
              <div className="relative group">
                <i className="fa-solid fa-magnifying-glass text-2xl text-accent2 group-hover:text-[#4caf50] transition-colors cursor-pointer" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="absolute top-1/2 -translate-y-1/2 right-0 w-0 group-hover:w-40 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white text-accent6 border border-accent3 rounded-md px-2 py-1"
                />
              </div>

              {/* Login Icon */}
              <button
                onClick={() => setIsLoginOpen(true)}
                className="text-accent2 hover:text-secondary transition-colors"
              >
                <i className="fa-regular fa-user text-xl" />
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden text-accent2 hover:text-secondary"
              >
                <i className="fas fa-bars text-xl" />
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div
            className={`${
              isMobileOpen ? "block" : "hidden"
            } md:hidden py-4 border-t border-accent5 bg-accent4`}
          >
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className="font-nunito text-accent2 hover:text-secondary font-semibold transition-colors"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-accent2 hover:text-primary font-medium transition-colors"
              >
                About Us
              </Link>
              <Link
                to="/shop"
                className="font-nunito text-accent2 hover:text-secondary font-semibold transition-colors"
              >
                Shop
              </Link>
              <Link
                to="/ideas"
                className="text-accent2 hover:text-primary font-medium transition-colors"
              >
                Idea Sharing
              </Link>
              <Link
                to="/news"
                className="text-accent2 hover:text-primary font-medium transition-colors"
              >
                News Corner
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* LOGIN MODAL */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </>
  );
};

export default Navbar;
