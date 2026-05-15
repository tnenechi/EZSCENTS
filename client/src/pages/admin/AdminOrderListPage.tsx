import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, Eye, Search, Filter, X } from 'lucide-react';
import { getAllOrders } from '../../services/orderService';
import AdminLayout from '../../components/layout/AdminLayout';

const AdminOrderListPage = () => {
  const [keyword, setKeyword] = useState('');
  const [isPaid, setIsPaid] = useState('');
  const [isDelivered, setIsDelivered] = useState('');

  const { data: orders, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-orders', keyword, isPaid, isDelivered],
    queryFn: () => getAllOrders({ keyword, isPaid, isDelivered }),
  });

  const clearFilters = () => {
    setKeyword('');
    setIsPaid('');
    setIsDelivered('');
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 pb-6 border-b border-white/5 gap-6">
        <div>
          <h2 className="text-[10px] uppercase tracking-[0.4em] text-premium-gold mb-2 font-bold">Sales & Fulfillment</h2>
          <h1 className="text-4xl font-bold tracking-tight uppercase">Customer Orders</h1>
        </div>
        <div className="text-right flex items-end gap-8">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1 font-bold">Total Orders</p>
            <p className="text-2xl font-bold">{orders?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="relative col-span-1 md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search Order ID, Customer Name or Email..."
            className="w-full bg-white/5 border border-white/10 rounded-sm py-2.5 pl-10 pr-4 text-xs font-bold focus:outline-none focus:border-premium-gold/50 transition-colors"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <select
            className="w-full bg-white/5 border border-white/10 rounded-sm py-2.5 pl-9 pr-4 text-[10px] uppercase font-bold tracking-widest focus:outline-none focus:border-premium-gold/50 transition-colors appearance-none"
            value={isPaid}
            onChange={(e) => setIsPaid(e.target.value)}
          >
            <option value="">Payment: All</option>
            <option value="true">Paid</option>
            <option value="false">Pending</option>
          </select>
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <select
            className="w-full bg-white/5 border border-white/10 rounded-sm py-2.5 pl-9 pr-4 text-[10px] uppercase font-bold tracking-widest focus:outline-none focus:border-premium-gold/50 transition-colors appearance-none"
            value={isDelivered}
            onChange={(e) => setIsDelivered(e.target.value)}
          >
            <option value="">Delivery: All</option>
            <option value="true">Delivered</option>
            <option value="false">Processing</option>
          </select>
        </div>
      </div>

      {(keyword || isPaid || isDelivered) && (
        <div className="flex justify-end mb-6">
          <button 
            onClick={clearFilters}
            className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-premium-gold hover:text-white transition-colors"
          >
            <X size={14} /> Clear Filters
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-premium-gray/20 rounded-sm" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/50 p-8 text-center">
          <p className="text-red-500 text-xs uppercase tracking-widest font-bold">Failed to load orders.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                <th className="py-4 pr-4">Order ID</th>
                <th className="py-4 px-4">Customer</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4">Total</th>
                <th className="py-4 px-4">Paid</th>
                <th className="py-4 px-4">Delivered</th>
                <th className="py-4 pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((order: any) => (
                <tr key={order._id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="py-5 pr-4">
                    <span className="text-xs font-mono text-gray-300 font-bold">#{order._id.slice(-6).toUpperCase()}</span>
                  </td>
                  <td className="py-5 px-4">
                    <p className="text-xs font-bold uppercase tracking-tight text-white">{order.user?.name || order.guestInfo?.name || 'Guest'}</p>
                    <p className="text-[10px] text-gray-400 truncate max-w-[150px] font-bold">{order.user?.email || order.guestInfo?.email}</p>
                  </td>
                  <td className="py-5 px-4">
                    <p className="text-[10px] uppercase text-gray-300 font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="py-5 px-4 font-bold text-xs text-white">
                    ₦{order.totalPrice.toLocaleString()}
                  </td>
                  <td className="py-5 px-4">
                    {order.isPaid ? (
                      <span className="flex items-center gap-1 text-green-500 text-[9px] uppercase font-bold tracking-widest">
                        <CheckCircle2 size={12} /> {new Date(order.paidAt).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-500 text-[9px] uppercase font-bold tracking-widest">
                        <Clock size={12} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="py-5 px-4">
                    {order.isDelivered ? (
                      <span className="flex items-center gap-1 text-premium-gold text-[9px] uppercase font-bold tracking-widest">
                        <CheckCircle2 size={12} /> {new Date(order.deliveredAt).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-400 text-[9px] uppercase font-bold tracking-widest">
                        <Clock size={12} /> Processing
                      </span>
                    )}
                  </td>
                  <td className="py-5 pl-4 text-right">
                    <Link 
                      to={`/order/${order._id}`}
                      className="inline-flex items-center gap-2 bg-white/5 hover:bg-white text-gray-300 hover:text-black p-2 rounded-sm transition-all"
                    >
                      <Eye size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {orders.length === 0 && (
            <div className="py-20 text-center border border-dashed border-white/10 mt-4">
              <p className="text-gray-400 uppercase tracking-widest text-[10px] font-bold">No orders found in database.</p>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrderListPage;
