import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Tag, 
  Users, 
  ArrowLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { userInfo } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

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
    <div className="min-h-screen bg-premium-black text-white flex">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-premium-gray/20 flex flex-col">
        <div className="p-8 border-b border-white/5">
          <Link to="/" className="flex items-center gap-2 text-premium-gold hover:text-white transition-colors uppercase text-[10px] font-bold tracking-[0.3em]">
            <ArrowLeft size={14} /> Back to Store
          </Link>
          <h1 className="mt-6 text-xl font-bold tracking-tight uppercase">Management</h1>
        </div>

        <nav className="flex-1 py-8 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
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
        <div className="p-12 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
