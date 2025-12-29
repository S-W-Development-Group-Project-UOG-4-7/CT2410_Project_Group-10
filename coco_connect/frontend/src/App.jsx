import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";

import IdeaSharing from "./pages/IdeaSharing";
import Product from "./pages/Product-pg";
import Cart from "./pages/Cart"; // ✅ Added Cart import 
import Investment from "./pages/Investment";

import About from "./pages/About"; // I can create this for you


function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-gray-200">
      <Navbar />

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/investment" element={<Investment />} />
          <Route path="/ideas" element={<IdeaSharing />} />

          <Route path="/shop" element={<Product />} />
          <Route path="/cart" element={<Cart />} /> {/* ✅ Cart route added */}

          <Route path="/about" element={<About />} />

        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;
        