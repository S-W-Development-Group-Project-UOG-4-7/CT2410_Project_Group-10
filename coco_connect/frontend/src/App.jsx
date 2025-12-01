import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import "./index.css";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />
      <Home />
      <Footer />
    </div>
  );
}

export default App;
