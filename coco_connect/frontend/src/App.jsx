import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import IdeaSharing from "./pages/IdeaSharing"; 
import Investment from "./pages/Investment";
import Blockchain from "./admin/pages/Blockchain";

import CustomerLayout from "./customer/layout/CustomerLayout";
import Overview from "./customer/pages/Overview";
import Profile from "./customer/pages/Profile";
import EditProfile from "./customer/pages/EditProfile";
import Orders from "./customer/pages/Orders";
import ProtectedCustomerRoute from "./customer/ProtectedCustomerRoute";

// Layout wrapper component that conditionally shows Navbar/Footer
function LayoutWrapper({ children }) {
  const location = useLocation();
  const isCustomerRoute = location.pathname.startsWith('/customer');
  
  // Hide Navbar/Footer for customer portal routes
  if (isCustomerRoute) {
    return <>{children}</>;
  }
  
  // Show Navbar/Footer for all other routes
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-gray-200">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* Public routes with Navbar/Footer */}
      <Route path="/" element={
        <LayoutWrapper>
          <Home />
        </LayoutWrapper>
      } />
      
      <Route path="/about" element={
        <LayoutWrapper>
          <About />
        </LayoutWrapper>
      } />
      
      <Route path="/investment" element={
        <LayoutWrapper>
          <Investment />
        </LayoutWrapper>
      } />
      
      <Route path="/ideas" element={
        <LayoutWrapper>
          <IdeaSharing />
        </LayoutWrapper>
      } />
      
      <Route path="/admin/blockchain" element={
        <LayoutWrapper>
          <Blockchain />
        </LayoutWrapper>
      } />
      
      {/* Customer portal routes WITHOUT Navbar/Footer */}
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