import { Routes, Route } from "react-router-dom";
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
//import Upgrade from "./customer/pages/Upgrade";
import ProtectedCustomerRoute from "./customer/ProtectedCustomerRoute";


function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-gray-200">
      
      <Navbar />

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/investment" element={<Investment />} />
          <Route path="/ideas" element={<IdeaSharing />} />

          <Route path="/admin/blockchain" element={<Blockchain />} />

          <Route element={<ProtectedCustomerRoute />}>
          <Route path="/customer" element={<CustomerLayout />}>
            <Route index element={<Overview />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/edit" element={<EditProfile />} />
            <Route path="orders" element={<Orders />} />
          </Route>
        </Route>


      {/*<Route path="/customer-test" element={<div>TEST OK</div>} />*/}

        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;
        