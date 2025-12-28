import { Outlet, Link, useLocation } from "react-router-dom";
import { 
  Home, 
  User, 
  Package, 
  LogOut,
  ChevronRight,
  Bell,
  HelpCircle
} from "lucide-react";
import { useState, useEffect } from "react";

export default function CustomerLayout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Navigation items with icons
  const navItems = [
    { path: "/customer", label: "Overview", icon: <Home size={20} /> },
    { path: "/customer/profile", label: "My Profile", icon: <User size={20} /> },
    { path: "/customer/orders", label: "My Orders", icon: <Package size={20} /> },
    { path: "/customer/notifications", label: "Notifications", icon: <Bell size={20} /> },
    { path: "/customer/support", label: "Help & Support", icon: <HelpCircle size={20} /> },
  ];

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#ece7e1]">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-[#e5e7eb] p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-[#f9faf7] transition-colors"
          >
            <div className="space-y-1">
              <span className="block w-6 h-0.5 bg-[#2f3e46]"></span>
              <span className="block w-4 h-0.5 bg-[#2f3e46]"></span>
              <span className="block w-5 h-0.5 bg-[#2f3e46]"></span>
            </div>
          </button>
          
          <h1 className="logo-text text-xl">
            <span className="coco-text">Coco</span>
            <span className="connect-text">Connect</span>
          </h1>
          
          <div className="w-10"></div> {/* Spacer */}
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex flex-col w-64 bg-white text-black border-r border-[#e5e7eb] min-h-screen">
          {/* Logo */}
          <div className="p-6 border-b border-[#e5e7eb]">
            <h1 className="logo-text text-2xl text-center">
              <span className="coco-text">Coco</span>
              <span className="connect-text">Connect</span>
            </h1>
            <p className="text-sm text-[#6b7280] mt-1 text-center">Customer Portal</p>
          </div>
          
          {/* User Info */}
          <div className="p-6 border-b border-[#e5e7eb]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#8bc34a] to-[#689f38] rounded-full flex items-center justify-center text-white font-semibold">
                JD
              </div>
              <div>
                <p className="font-semibold">John Doe</p>
                <p className="text-sm text-[#6b7280]">Premium Member</p>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-[#8bc34a]/10 to-transparent border-l-4 border-[#8bc34a] text-[#2f3e46] font-semibold' 
                        : 'hover:bg-[#f9faf7] text-[#4b5563]'
                      }
                    `}
                  >
                    <span className={isActive ? 'text-[#8bc34a]' : 'text-[#9ca3af]'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                    {isActive && (
                      <ChevronRight size={16} className="ml-auto text-[#8bc34a]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>
          
          {/* Logout */}
          <div className="p-4 border-t border-[#e5e7eb]">
            <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-[#ef4444] hover:bg-[#fee2e2] transition-colors">
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        {/* Mobile Sidebar */}
        <aside className={`
          lg:hidden fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {/* Mobile Sidebar Content */}
          <div className="p-6 border-b border-[#e5e7eb]">
            <h1 className="logo-text text-xl">
              <span className="coco-text">Coco</span>
              <span className="connect-text">Connect</span>
            </h1>
          </div>
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-gradient-to-r from-[#8bc34a]/10 to-transparent text-[#2f3e46] font-semibold' 
                      : 'hover:bg-[#f9faf7] text-[#4b5563]'
                    }
                  `}
                >
                  <span className={isActive ? 'text-[#8bc34a]' : 'text-[#9ca3af]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {/* Breadcrumb */}
          <div className="bg-white border-b border-[#e5e7eb] px-6 py-4">
            <nav className="flex items-center gap-2 text-sm">
              <Link 
                to="/" 
                className="text-[#6b7280] hover:text-[#2f3e46] transition-colors"
              >
                Home
              </Link>
              <ChevronRight size={16} className="text-[#9ca3af]" />
              <span className="text-[#2f3e46] font-medium">
                {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
              </span>
            </nav>
          </div>
          
          {/* Content Area */}
          <div className="p-4 lg:p-6 bg-gradient-to-b from-[#f9faf7] to-[#ece7e1] min-h-[calc(100vh-64px)]">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Add these Tailwind classes to your existing CSS */}
      <style jsx>{`
        .logo-text {
          font-family: "Bangers", cursive;
          font-size: 2.5rem;
          letter-spacing: 2px;
        }
        
        @media (max-width: 1024px) {
          .logo-text {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </div>
  );
}