<<<<<<< HEAD
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

=======
// src/App.jsx
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// PUBLIC PAGES
>>>>>>> 45b3043379462f7f9d97cc4240df94bff04de370
import Home from "./pages/Home";

import IdeaSharing from "./pages/IdeaSharing";
import Product from "./pages/Product-pg";
<<<<<<< HEAD
import Cart from "./pages/Cart"; // ✅ Added Cart import 
=======
import Cart from "./pages/Cart";
>>>>>>> 45b3043379462f7f9d97cc4240df94bff04de370
import Investment from "./pages/Investment";
import News from "./pages/News";

<<<<<<< HEAD
import About from "./pages/About"; // I can create this for you
import News from "./pages/News";


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
          <Route path="/news" element={<News />} />

        </Routes>
      </div>

=======
// ADMIN PAGES
import AdminLayout from "./admin/layout/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import Users from "./admin/pages/Users";
import Blockchain from "./admin/pages/Blockchain";
import AdminNews from "./admin/pages/AdminNews";
import ProtectedAdminRoute from "./admin/ProtectedAdminRoute";

// CUSTOMER PAGES
import CustomerLayout from "./customer/layout/CustomerLayout";
import Overview from "./customer/pages/Overview";
import Profile from "./customer/pages/Profile";
import EditProfile from "./customer/pages/EditProfile";
import Orders from "./customer/pages/Orders";
import ProtectedCustomerRoute from "./customer/ProtectedCustomerRoute";

function LayoutWrapper({ children }) {
  const { pathname } = useLocation();

  if (pathname.startsWith("/customer")) return <>{children}</>;
  if (pathname.startsWith("/admin")) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-gray-200">
      <Navbar />
      <main className="flex-1">{children}</main>
>>>>>>> 45b3043379462f7f9d97cc4240df94bff04de370
      <Footer />
    </div>
  );
}

<<<<<<< HEAD
export default App;
        
=======
const W = (Page) => (<LayoutWrapper> <Page /></LayoutWrapper>);

export default function App() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/" element={W(Home)} />
      <Route path="/about" element={W(About)} />
      <Route path="/investment" element={W(Investment)} />
      <Route path="/ideas" element={W(IdeaSharing)} />
      <Route path="/shop" element={W(Product)} />
      <Route path="/cart" element={W(Cart)} />
      <Route path="/news" element={W(News)} />

      {/* ADMIN (PROTECTED) */}
      <Route element={<ProtectedAdminRoute />}>
        <Route  path="/admin"  element={  <AdminLayout>  <Dashboard />  </AdminLayout>  }  />
        <Route  path="/admin/users" element={  <AdminLayout>  <Users />  </AdminLayout>  }  />
        <Route  path="/admin/blockchain"  element={  <AdminLayout> <Blockchain />  </AdminLayout>  }  />
        <Route  path="/admin/news"  element={ <AdminLayout> <AdminNews /> </AdminLayout> }/>
      </Route>

      {/* CUSTOMER (PROTECTED) */}
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
>>>>>>> 45b3043379462f7f9d97cc4240df94bff04de370
