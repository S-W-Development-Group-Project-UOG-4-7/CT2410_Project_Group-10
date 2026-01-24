// src/App.jsx
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import About from "./pages/About";
import IdeaSharing from "./pages/IdeaSharing";
import Product from "./pages/Product-pg";
import Cart from "./pages/Cart";
import Investment from "./pages/Investment";
import Blockchain from "./admin/pages/Blockchain";
import News from "./pages/News";

import CustomerLayout from "./customer/layout/CustomerLayout";
import Overview from "./customer/pages/Overview";
import Profile from "./customer/pages/Profile";
import EditProfile from "./customer/pages/EditProfile";
import Orders from "./customer/pages/Orders";
import ProtectedCustomerRoute from "./customer/ProtectedCustomerRoute";

function LayoutWrapper({ children }) {
  const { pathname } = useLocation();
  if (pathname.startsWith("/customer")) return <>{children}</>;
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-gray-200">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

const W = (Page) => (
  <LayoutWrapper>
    <Page />
  </LayoutWrapper>
);

function App() {
  return (
    <Routes>
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
      <Route path="/admin/blockchain" element={W(Blockchain)} />

      <Route element={<ProtectedCustomerRoute />}>
        <Route path="/customer/*" element={<CustomerLayout />}>
          <Route index element={<Overview />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/edit" element={<EditProfile />} />
          <Route path="orders" element={<Orders />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
