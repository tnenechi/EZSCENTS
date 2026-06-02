import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Tag, 
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { userInfo } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/login');
    }
  }, [userInfo, navigate]);

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Promotions', path: '/admin/promotions', icon: Tag },
    { name: 'Security', path: '/admin/security', icon: ShieldCheck },
  ];

  if (!userInfo || userInfo.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-premium-black text-white flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-white/5 sticky top-0 bg-premium-black z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
            <img src="/images/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-lg font-bold tracking-tight uppercase">Management</h1>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-64 border-r border-white/5 bg-premium-gray/20 flex flex-col z-[60]
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-8 border-b border-white/5 relative">
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden absolute right-4 top-4 p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <Link 
            to="/" 
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center gap-2 text-premium-gold hover:text-white transition-colors uppercase text-[10px] font-bold tracking-[0.3em]"
          >
            <ArrowLeft size={14} /> Back to Store
          </Link>
          <div className="mt-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
              <img src="/images/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-xl font-bold tracking-tight uppercase">Management</h1>
          </div>
        </div>

        <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center justify-between p-4 text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm ${
                  isActive 
                    ? 'bg-premium-gold text-black' 
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  {item.name}
                </div>
                {isActive && <ChevronRight size={14} />}
              </Link>
            );
          })}
        </nav>

        <div className="p-8 border-t border-white/5">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-bold">Signed in as</p>
          <p className="text-xs font-bold truncate text-white">{userInfo.name}</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-premium-black admin-content">
        <div className="p-6 md:p-12 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
