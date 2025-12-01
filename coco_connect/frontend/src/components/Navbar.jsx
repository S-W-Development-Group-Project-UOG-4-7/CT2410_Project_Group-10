function Navbar() {
  return (
    <nav className="bg-slate-900 text-white w-full fixed top-0 left-0 z-50">
      <div className="max-w-[1600px] mx-auto px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold">
            CC
          </div>
          <span className="font-semibold text-xl">Coco Connect</span>
        </div>

        {/* Menu */}
        <ul className="hidden md:flex gap-8 text-sm">
          <li>
            <a href="#home" className="hover:text-indigo-300">
              Home
            </a>
          </li>
          <li>
            <a href="#features" className="hover:text-indigo-300">
              Features
            </a>
          </li>
          <li>
            <a href="#about" className="hover:text-indigo-300">
              About
            </a>
          </li>
          <li>
            <a href="#contact" className="hover:text-indigo-300">
              Contact
            </a>
          </li>
        </ul>

        {/* Login Btn */}
        <button className="text-sm bg-indigo-500 hover:bg-indigo-600 px-5 py-2 rounded-md">
          Login
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
