import { Routes, Route } from "react-router-dom";

// PUBLIC
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import IdeaSharing from "./pages/IdeaSharing";

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
