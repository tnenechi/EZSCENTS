import { Link } from "react-router-dom";
import { ShoppingBag, User as UserIcon, Search, Menu } from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";

const Navbar = () => {
  const items = useCartStore((state) => state.items);
  const userInfo = useAuthStore((state) => state.userInfo);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <button className="lg:hidden text-white">
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
        <button className="hover:text-premium-gold transition-colors">
          <Search size={20} />
        </button>
        
        {userInfo ? (
          <Link
            to="/account"
            className="flex items-center gap-2 hover:text-premium-gold transition-colors"
          >
            <UserIcon size={20} />
            <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest">
              {userInfo.name.split(' ')[0]}
            </span>
          </Link>
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
    </nav>
  );
};

export default Navbar;
