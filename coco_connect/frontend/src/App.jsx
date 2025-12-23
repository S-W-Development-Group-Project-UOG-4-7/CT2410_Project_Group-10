import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import IdeaSharing from "./pages/IdeaSharing"; 
import Investment from "./pages/Investment";

import Blockchain from "./admin/pages/Blockchain";

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
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;
        