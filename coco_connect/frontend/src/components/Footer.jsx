import React, { useState } from "react";

export default function Footer() {
  return (
    <footer className="footer-bg mt-10 text-bold text-#f9faf7">
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-6">
        <div className="footer-glass rounded-3xl shadow-xl px-8 py-10">

          {/*<div className="grid grid-cols-1 md:grid-cols-4 gap-4">*/}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_1fr] gap-4">


            {/* Logo + About */}
            <div>
              <div className="flex items-center mb-4">
                {/*<img src="/tree.png"  alt="Cococonnect Logo"  className="w-10 h-auto mr-3" />*/}
                <div className="logo-text">
                  <span className="coco-text">COCO</span>
                  <span className="connect-text">CONNECT</span>
                </div>
              </div>
              <p className="text-sm text-#ece7e1 text-justify">
                CocoConnect is a digital platform designed to support farmers, buyers,
                and the coconut industry through smart collaboration and market connectivity.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold mb-3">Quick Links</h3>
              <ul className="space-y-1 text-sm text-#f9faf7">
                <li><a href="#" className="hover:text-connect">Home</a></li>
                <li><a href="#" className="hover:text-connect">Marketplace</a></li>
                <li><a href="#" className="hover:text-connect">Investment</a></li>
                <li><a href="#" className="hover:text-connect">About Us</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-lg font-bold mb-3">Resources</h3>
              <ul className="space-y-1 text-sm text-#f9faf7">
                <li><a href="#" className="hover:text-connect">Help Center</a></li>
                <li><a href="#" className="hover:text-connect">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-connect">Terms & Conditions</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-bold mb-3">Contact Us</h3>
              <ul className="text-sm space-y-1 text-#f9faf7">
                <li>Email: <span className="font-medium">support@cococonnect.com</span></li>
                <li>Phone: <span className="font-medium">+94 71 234 5678</span></li>
                <li>Address: Colombo, Sri Lanka</li>
              </ul>

              <div className="flex space-x-4 mt-4 text-xl">
                <a href="#" className="text-#f9faf7 hover:text-connect"><i className="fab fa-facebook"></i></a>
                <a href="#" className="text-#f9faf7 hover:text-connect"><i className="fab fa-instagram"></i></a>
                <a href="#" className="text-#f9faf7 hover:text-connect"><i className="fab fa-linkedin"></i></a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 mt-8 pt-4 text-center text-xs md:text-sm text-#f9faf7/70">
            © 2025 CocoConnect. All rights reserved.
          </div>

        </div>
      </div>
    </footer>
  );
}
