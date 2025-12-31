import { Routes, Route } from "react-router-dom";

// PUBLIC
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import IdeaSharing from "./pages/IdeaSharing";

import Product from "./pages/Product-pg";
import Cart from "./pages/Cart"; // ✅ Added Cart import
import Investment from "./pages/Investment";

import About from "./pages/About"; // I can create this for you
import News from "./pages/News";

// ADMIN
import AdminLayout from "./admin/layout/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import Users from "./admin/pages/Users";
import Blockchain from "./admin/pages/Blockchain";

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f9faf7]">
      <Navbar />
      <div className="flex-1">{children}</div>

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/investment" element={<Investment />} />
          <Route path="/ideas" element={<IdeaSharing />} />
          <Route path="/shop" element={<Product />} />
          <Route path="/cart" element={<Cart />} /> {/* ✅ Cart route added */}
          <Route path="/about" element={<About />} />
          <Route path="/news" element={<News />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* 🌍 PUBLIC ROUTES */}
      <Route
        path="/"
        element={
          <PublicLayout>
            <Home />
          </PublicLayout>
        }
      />

      <Route
        path="/ideas"
        element={
          <PublicLayout>
            <IdeaSharing />
          </PublicLayout>
        }
      />

      {/* 🔐 ADMIN ROUTES */}
      <Route
        path="/admin"
        element={
          <AdminLayout>
            <Dashboard />
          </AdminLayout>
        }
      />

      <Route
        path="/admin/users"
        element={
          <AdminLayout>
            <Users />
          </AdminLayout>
        }
      />

      <Route
        path="/admin/blockchain"
        element={
          <AdminLayout>
            <Blockchain />
          </AdminLayout>
        }
      />
    </Routes>
  );
}
