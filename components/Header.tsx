
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Menu, 
  X, 
  Home, 
  ChevronDown, 
  Phone, 
  User,
  Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isAdmin = user?.role === 'admin';

  const navLinks = [
    { label: 'Home', path: '/', icon: <Home size={18} className="mr-1" /> },
    { label: 'Insurance', path: '/#policies', hasDropdown: true },
    { label: 'Manage your policy', path: '/customers' },
    { label: 'Make a claim', path: '/contact' },
    { label: 'Help', path: '/help' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogoClick = (e: React.MouseEvent) => {
    setIsOpen(false);
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#2d1f2d] text-white shadow-xl border-b border-white/5">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex items-center gap-2">
            <Link 
              to="/" 
              onClick={handleLogoClick}
              className="flex items-center gap-2 group cursor-pointer"
              aria-label="SwiftPolicy Home"
            >
              <div className="bg-[#e91e8c] p-1 rounded-lg transition-all group-hover:scale-110 group-active:scale-95">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white font-outfit">
                SwiftPolicy
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Center */}
          <nav className="hidden items-center gap-6 xl:gap-8 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                className={`flex items-center text-[15px] font-semibold transition-colors hover:text-[#ff4da6] whitespace-nowrap ${
                  isActive(link.path) ? 'text-white border-b-2 border-[#e91e8c] pb-1 mt-1' : 'text-white'
                }`}
              >
                {link.icon}
                {link.label}
                {link.hasDropdown && <ChevronDown size={14} className="ml-1 opacity-70" />}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin/mid-status"
                className={`flex items-center gap-2 text-[15px] font-bold px-4 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all ${
                  isActive('/admin/mid-status') ? 'border-[#e91e8c] text-[#e91e8c]' : 'text-[#e91e8c]'
                }`}
              >
                <Database size={16} />
                MID Ops
              </Link>
            )}
          </nav>

          {/* Right Action Section */}
          <div className="hidden items-center gap-6 lg:flex">
            <Link 
              to="/contact" 
              className="flex items-center gap-2 text-[15px] font-semibold hover:text-[#ff4da6] transition-colors"
            >
              <Phone size={18} />
              Contact us
            </Link>
            
            <Link
              to={user ? "/customers" : "/auth"}
              className="bg-[#e91e8c] hover:bg-[#c4167a] text-white px-6 py-2.5 rounded-xl text-[15px] font-bold transition-all shadow-lg shadow-pink-900/20 whitespace-nowrap"
            >
              My Account
            </Link>

            {user && (
              <button 
                onClick={logout} 
                className="text-[11px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="lg:hidden text-white p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="lg:hidden border-t border-white/5 bg-[#2d1f2d] animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 text-lg font-semibold text-white hover:text-[#e91e8c]"
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin/mid-status"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 text-lg font-bold text-[#e91e8c] bg-white/5 p-3 rounded-xl"
              >
                <Database size={20} /> MID Operations
              </Link>
            )}
            <div className="pt-4 border-t border-white/10 space-y-4">
              <Link 
                to="/contact" 
                onClick={() => setIsOpen(false)} 
                className="flex items-center gap-2 text-white font-semibold"
              >
                <Phone size={20} /> Contact us
              </Link>
              <Link 
                to={user ? "/customers" : "/auth"} 
                onClick={() => setIsOpen(false)} 
                className="w-full bg-[#e91e8c] text-white px-4 py-4 rounded-xl text-center font-bold block shadow-lg"
              >
                My Account
              </Link>
              {user && (
                <button 
                  onClick={() => { logout(); setIsOpen(false); }} 
                  className="w-full text-center text-white/40 font-bold uppercase tracking-widest text-xs"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
