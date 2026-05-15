import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, Eye } from 'lucide-react';
import { getAllOrders } from '../../services/orderService';
import AdminLayout from '../../components/layout/AdminLayout';

const AdminOrderListPage = () => {
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: getAllOrders,
  });

  return (
    <AdminLayout>
      <div className="flex justify-between items-end mb-12 pb-6 border-b border-white/5">
        <div>
          <h2 className="text-[10px] uppercase tracking-[0.4em] text-premium-gold mb-2 font-bold">Sales & Fulfillment</h2>
          <h1 className="text-4xl font-bold tracking-tight uppercase">Customer Orders</h1>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1 font-bold">Total Orders</p>
          <p className="text-2xl font-bold">{orders?.length || 0}</p>
        </div>
      </div>

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
