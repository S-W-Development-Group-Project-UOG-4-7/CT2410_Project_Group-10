import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import IdeaSharing from "./pages/IdeaSharing";
import Product from "./pages/Product-pg";
import Cart from "./pages/Cart"; // ✅ Added Cart import

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-gray-200">
      <Navbar />

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ideas" element={<IdeaSharing />} />
          <Route path="/shop" element={<Product />} />
          <Route path="/cart" element={<Cart />} /> {/* ✅ Cart route added */}
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;
