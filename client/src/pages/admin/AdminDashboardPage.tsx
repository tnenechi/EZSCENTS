import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Package, Tag, TrendingUp, DollarSign } from 'lucide-react';
import { getAllOrders } from '../../services/orderService';
import { getProducts } from '../../services/productService';
import { getActivePromotions } from '../../services/promotionService';
import AdminLayout from '../../components/layout/AdminLayout';
import type { Order, Promotion } from '../../types';

const AdminDashboardPage = () => {
  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({ 
    queryKey: ['admin-orders'], 
    queryFn: () => getAllOrders() 
  });
  
  const { data: productsData, isLoading: productsLoading } = useQuery({ 
    queryKey: ['admin-products'], 
    queryFn: () => getProducts() 
  });
  
  const { data: promos, isLoading: promosLoading } = useQuery<Promotion[]>({ 
    queryKey: ['admin-promos'], 
    queryFn: getActivePromotions 
  });

  const isLoading = ordersLoading || productsLoading || promosLoading;

  const totalRevenue = orders?.reduce((acc: number, order: Order) => order.isPaid ? acc + order.totalPrice : acc, 0) || 0;
  const pendingOrders = orders?.filter((order: Order) => !order.isPaid).length || 0;

  const stats = [
    { name: 'Total Revenue', value: `₦${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-500' },
    { name: 'Total Orders', value: orders?.length || 0, icon: ShoppingBag, color: 'text-blue-500' },
    { name: 'Live Products', value: productsData?.products.length || 0, icon: Package, color: 'text-premium-gold' },
    { name: 'Active Promos', value: promos?.length || 0, icon: Tag, color: 'text-purple-500' },
  ];

  return (
    <AdminLayout>
      <div className="mb-12">
        <h2 className="text-[10px] uppercase tracking-[0.4em] text-premium-gold mb-2 font-bold">Overview</h2>
        <h1 className="text-4xl font-bold tracking-tight uppercase">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-32 w-full bg-premium-gray rounded-sm" />
          ))
        ) : (
          stats.map((stat) => (
            <div key={stat.name} className="bg-premium-gray border border-premium-border/30 p-8 rounded-sm">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-sm bg-premium-gray ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                {stat.name === 'Total Revenue' && (
                  <span className="flex items-center gap-1 text-green-500 text-[10px] font-bold uppercase tracking-widest bg-green-500/10 px-2 py-1">
                    <TrendingUp size={12} /> +12%
                  </span>
                )}
              </div>
              <p className="text-[10px] uppercase tracking-widest text-premium-muted mb-1 font-bold">{stat.name}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {isLoading ? (
          [...Array(2)].map((_, i) => (
            <div key={i} className="skeleton h-64 w-full bg-premium-gray rounded-sm" />
          ))
        ) : (
          <>
            <div className="bg-premium-gray border border-premium-border/30 p-8 rounded-sm">
              <h3 className="text-[10px] uppercase tracking-widest font-bold text-premium-gold mb-6 border-b border-premium-border/20 pb-4">
                Order Status Distribution
              </h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs uppercase tracking-widest font-bold">
                    <span className="text-premium-muted">Paid & Processing</span>
                    <span className="font-bold">{orders?.filter((o: any) => o.isPaid).length || 0}</span>
                  </div>
                  <div className="h-1 bg-premium-gray rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[70%]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs uppercase tracking-widest font-bold">
                    <span className="text-premium-muted">Awaiting Payment</span>
                    <span className="font-bold">{pendingOrders}</span>
                  </div>
                  <div className="h-1 bg-premium-gray rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 w-[30%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-premium-gray border border-premium-border/30 p-8 rounded-sm">
              <h3 className="text-[10px] uppercase tracking-widest font-bold text-premium-gold mb-6 border-b border-premium-border/20 pb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {orders?.slice(0, 5).map((order: any) => (
                  <div key={order._id} className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
                    <span className="text-premium-muted font-mono">Order #{order._id.slice(-6).toUpperCase()}</span>
                    <span className="font-bold text-foreground">₦{order.totalPrice.toLocaleString()}</span>
                    <span className={order.isPaid ? 'text-green-500' : 'text-yellow-500'}>
                      {order.isPaid ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
