// src/App.jsx
import { Routes, Route, useLocation } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// PUBLIC PAGES
import Home from "./pages/Home";
import About from "./pages/About";
import IdeaSharing from "./pages/IdeaSharing";
import Product from "./pages/Product-pg";
import Cart from "./pages/Cart";
import Investment from "./pages/Investment";
import News from "./pages/News";

// ADMIN PAGES
import AdminLayout from "./admin/layout/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import Users from "./admin/pages/Users";
import Blockchain from "./admin/pages/Blockchain";
import AdminNews from "./admin/pages/AdminNews";
import AdminProducts from "./admin/pages/AdminProducts";
import ProtectedAdminRoute from "./admin/ProtectedAdminRoute";


// CUSTOMER PAGES
import CustomerLayout from "./customer/layout/CustomerLayout";
import Overview from "./customer/pages/Overview";
import Profile from "./customer/pages/Profile";
import EditProfile from "./customer/pages/EditProfile";
import Orders from "./customer/pages/Orders";
import MyProducts from "./customer/pages/MyProducts";
import ProtectedCustomerRoute from "./customer/ProtectedCustomerRoute";

/* ----------------------------------
   Layout Wrapper
---------------------------------- */
function LayoutWrapper({ children }) {
  const { pathname } = useLocation();

  // Admin & Customer pages manage their own layout
  if (pathname.startsWith("/admin")) return <>{children}</>;
  if (pathname.startsWith("/customer")) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-gray-200">
      {/* Toasts for public pages */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />

      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

/* Helper to wrap public pages */
const W = (Page) => (
  <LayoutWrapper>
    <Page />
  </LayoutWrapper>
);

/* ----------------------------------
   App
---------------------------------- */
export default function App() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/" element={W(Home)} />
      <Route path="/about" element={W(About)} />
      <Route path="/investment" element={W(Investment)} />

      {/* ✅ Ideas list / create */}
      <Route path="/ideas" element={W(IdeaSharing)} />

      {/* ✅ NEW: View single idea (used by BLOCK modal) */}
      <Route path="/ideas/:id" element={W(IdeaSharing)} />

      <Route path="/shop" element={W(Product)} />
      <Route path="/cart" element={W(Cart)} />
      <Route path="/news" element={W(News)} />

      {/* ADMIN (PROTECTED) */}
      <Route element={<ProtectedAdminRoute />}>
        <Route  path="/admin"  element={  <AdminLayout>    <Dashboard />  </AdminLayout>  } />
        <Route  path="/admin/users"  element={   <AdminLayout>    <Users />  </AdminLayout>  }  />
        <Route  path="/admin/blockchain"  element={  <AdminLayout>    <Blockchain />  </AdminLayout>  }  />
        <Route  path="/admin/news"  element={   <AdminLayout>   <AdminNews />    </AdminLayout>  }  />
        <Route path="/admin/products" element={<AdminLayout><AdminProducts/></AdminLayout>} />
      </Route>

      {/* CUSTOMER (PROTECTED) */}
      <Route element={<ProtectedCustomerRoute />}>
        <Route path="/customer/*" element={<CustomerLayout />}>
          <Route index element={<Overview />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/edit" element={<EditProfile />} />
          <Route path="orders" element={<Orders />} />
          <Route path="products" element={<MyProducts />} />  
        </Route>
      </Route>
    </Routes>
  );
}
