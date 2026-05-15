import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, User as UserIcon, Search, Menu, LogOut, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const items = useCartStore((state) => state.items);
  const { userInfo, logout } = useAuthStore();
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?keyword=${searchQuery}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const menuVariants = {
    closed: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 30 } },
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
  };

  const searchVariants = {
    closed: { opacity: 0, y: -20, pointerEvents: "none" as const },
    open: { opacity: 1, y: 0, pointerEvents: "auto" as const }
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="lg:hidden text-white hover:text-premium-gold transition-colors"
          >
            <Menu size={24} />
          </button>
          <Link
            to="/"
            className="text-2xl font-bold tracking-widest text-white uppercase"
          >
            EzScents
          </Link>
          <div className="hidden lg:flex items-center gap-6 text-sm font-medium tracking-wide uppercase text-gray-400">
            <Link to="/shop" className="hover:text-white transition-colors">
              Shop All
            </Link>
            <Link
              to="/shop?category=men"
              className="hover:text-white transition-colors"
            >
              Men
            </Link>
            <Link
              to="/shop?category=women"
              className="hover:text-white transition-colors"
            >
              Women
            </Link>
            <Link
              to="/shop?category=unisex"
              className="hover:text-white transition-colors"
            >
              Unisex
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-6 text-white">
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="hover:text-premium-gold transition-colors"
          >
            {isSearchOpen ? <X size={20} /> : <Search size={20} />}
          </button>
          
          {userInfo ? (
            <div className="flex items-center gap-4">
              <Link
                to={userInfo.role === 'admin' ? "/admin" : "/profile"}
                className="flex items-center gap-2 hover:text-premium-gold transition-colors"
              >
                <UserIcon size={20} />
                <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest">
                  {userInfo.name.split(' ')[0]}
                </span>
              </Link>
              <button 
                onClick={handleLogout}
                className="hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 hover:text-premium-gold transition-colors"
            >
              <UserIcon size={20} />
              <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest">
                Login
              </span>
            </Link>
          )}

          <Link
            to="/cart"
            className="relative hover:text-premium-gold transition-colors"
          >
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-premium-gold text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </div>

        {/* Search Overlay */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={searchVariants}
              className="absolute top-full left-0 w-full bg-black/95 border-b border-white/10 p-6 z-40"
            >
              <form onSubmit={handleSearch} className="max-w-4xl mx-auto flex gap-4">
                <input
                  autoFocus
                  type="text"
                  placeholder="SEARCH FOR FRAGRANCES, BRANDS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-b border-white/20 py-4 text-xl uppercase tracking-widest outline-none focus:border-premium-gold transition-colors"
                />
                <button 
                  type="submit"
                  className="bg-premium-gold text-black px-8 uppercase text-[10px] font-bold tracking-widest hover:bg-white transition-colors"
                >
                  Search
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Menu Sidebar */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.aside
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              className="fixed top-0 left-0 h-full w-[80%] max-w-sm bg-premium-black z-[70] p-8 border-r border-white/10"
            >
              <div className="flex justify-between items-center mb-12">
                <span className="text-xl font-bold uppercase tracking-widest">Menu</span>
                <button onClick={() => setIsMenuOpen(false)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col gap-8">
                <Link 
                  to="/shop" 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl font-bold uppercase tracking-tighter hover:text-premium-gold transition-colors"
                >
                  Shop All
                </Link>
                <Link 
                  to="/shop?category=men" 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl font-bold uppercase tracking-tighter hover:text-premium-gold transition-colors"
                >
                  Men
                </Link>
                <Link 
                  to="/shop?category=women" 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl font-bold uppercase tracking-tighter hover:text-premium-gold transition-colors"
                >
                  Women
                </Link>
                <Link 
                  to="/shop?category=unisex" 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl font-bold uppercase tracking-tighter hover:text-premium-gold transition-colors"
                >
                  Unisex
                </Link>
                
                <div className="pt-8 border-t border-white/10 mt-8 space-y-6">
                  {userInfo ? (
                    <>
                      <Link 
                        to={userInfo.role === 'admin' ? "/admin" : "/profile"}
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-white"
                      >
                        My Account
                      </Link>
                      <button 
                        onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                        className="block text-[10px] font-bold uppercase tracking-[0.2em] text-red-500 hover:text-red-400"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link 
                      to="/login" 
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-[10px] font-bold uppercase tracking-[0.2em] text-premium-gold hover:text-white"
                    >
                      Login / Register
                    </Link>
                  )}
                </div>
              </div>

              <div className="absolute bottom-8 left-8 right-8">
                <p className="text-[9px] uppercase tracking-widest text-gray-600 font-bold">
                  EzScents Luxury Fragrances
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
