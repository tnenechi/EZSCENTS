import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock,
  Truck,
  CreditCard,
  Landmark,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  getOrderDetails,
  payOrder,
  updateOrderToDelivered,
} from "../services/orderService";
import { useAuthStore } from "../store/authStore";
import MainLayout from "../components/layout/MainLayout";

const OrderDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { userInfo } = useAuthStore();
  const queryClient = useQueryClient();

  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrderDetails(id as string),
    enabled: !!id,
  });

  const deliverMutation = useMutation({
    mutationFn: () => updateOrderToDelivered(id as string),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["order", id] }),
  });

  const payMutation = useMutation({
    mutationFn: () => payOrder(id as string, {}), // Empty object triggers manual admin pay
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["order", id] }),
  });

  if (isLoading)
    return (
      <MainLayout showSidebar={false}>
        <div className="animate-pulse py-20 text-center">
          Loading Order Details...
        </div>
      </MainLayout>
    );
  if (error || !order)
    return (
      <MainLayout showSidebar={false}>
        <div className="py-20 text-center text-red-500">
          Error loading order.
        </div>
      </MainLayout>
    );

  const isAdmin = userInfo?.role === "admin";

  return (
    <MainLayout showSidebar={false}>
      <div className="max-w-4xl mx-auto py-8">
        {/* Admin Action Center */}
        {isAdmin && (
          <div className="bg-premium-gold/10 border border-premium-gold/30 p-8 rounded-sm mb-12 animate-fade-in">
            <h2 className="text-[10px] uppercase tracking-[0.3em] text-premium-gold font-bold mb-6">
              Admin Fulfillment Center
            </h2>
            <div className="flex flex-wrap gap-4">
              {!order.isPaid && (
                <button
                  onClick={() => payMutation.mutate()}
                  disabled={payMutation.isPending}
                  className="bg-premium-gold text-black px-8 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-white transition-all disabled:opacity-50"
                >
                  {payMutation.isPending ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  Mark as Paid (Verified)
                </button>
              )}
              {order.isPaid && !order.isDelivered && (
                <button
                  onClick={() => deliverMutation.mutate()}
                  disabled={deliverMutation.isPending}
                  className="bg-white text-black px-8 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-premium-gold transition-all disabled:opacity-50"
                >
                  {deliverMutation.isPending ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <Truck size={14} />
                  )}
                  Mark as Dispatched
                </button>
              )}
              {order.isDelivered && (
                <div className="text-[10px] text-premium-gold font-bold uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle2 size={14} /> Fulfillment Complete
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight mb-2">
              Order #{order._id.slice(-6).toUpperCase()}
            </h1>
            <p className="text-gray-500 text-xs uppercase tracking-widest">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest ${
              order.isPaid
                ? "bg-green-500/10 text-green-500"
                : "bg-yellow-500/10 text-yellow-500"
            }`}
          >
            {order.isPaid ? <CheckCircle2 size={14} /> : <Clock size={14} />}
            {order.isPaid ? "Payment Confirmed" : "Payment Pending"}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-12">
            {/* Status Timeline */}
            <div className="space-y-6">
              <h2 className="text-[10px] uppercase tracking-widest font-bold text-premium-gold">
                Order Journey
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-premium-gold flex items-center justify-center text-black">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase">Order Placed</p>
                    <p className="text-[10px] text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div
                  className={`flex gap-4 ${order.isPaid ? "opacity-100" : "opacity-30"}`}
                >
                  <div className="w-8 h-8 rounded-full bg-premium-gold flex items-center justify-center text-black">
                    <CreditCard size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase">
                      Payment Verified
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {order.isPaid
                        ? "Payment received"
                        : "Awaiting verification"}
                    </p>
                  </div>
                </div>
                <div
                  className={`flex gap-4 ${order.isDelivered ? "opacity-100" : "opacity-30"}`}
                >
                  <div className="w-8 h-8 rounded-full bg-premium-gold flex items-center justify-center text-black">
                    <Truck size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase">Dispatched</p>
                    <p className="text-[10px] text-gray-500">
                      {order.isDelivered
                        ? "Out for delivery"
                        : "Pending dispatch"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="p-6 bg-premium-gray/20 border border-white/5 space-y-4">
              <div className="flex items-center gap-3">
                <Landmark size={20} className="text-premium-gold" />
                <h3 className="text-sm font-bold uppercase tracking-widest">
                  Payment: {order.paymentMethod}
                </h3>
              </div>

              {!order.isPaid && (
                <div className="space-y-6 pt-4 border-t border-white/5 animate-fade-in">
                  <div className="flex gap-3 text-yellow-500 bg-yellow-500/5 p-4 text-[10px] uppercase tracking-widest font-bold border border-yellow-500/10">
                    <AlertCircle size={16} className="shrink-0" />
                    <p>Awaiting Bank Transfer Verification</p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <p className="text-gray-500 uppercase text-[9px] font-bold tracking-widest">
                        Bank Details
                      </p>
                      <p className="font-bold">ZENITH BANK</p>
                      <p className="font-bold">1234567890</p>
                      <p className="font-bold text-premium-gold uppercase">
                        EZSCENTS INTERNATIONAL LIMITED
                      </p>
                      <p className="font-bold mt-2">
                        Amount: ₦{order.totalPrice.toLocaleString()}
                      </p>
                    </div>

                    <div className="space-y-2 text-gray-400 leading-relaxed">
                      <p>
                        Your order will only be processed when payment has been
                        received.
                      </p>
                      <p className="text-red-400/80 italic">
                        Please note: Orders not paid for within 24 hours of
                        purchase will be canceled and invalid.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/5 space-y-2">
                      <p className="text-gray-500 uppercase text-[9px] font-bold tracking-widest">
                        After Payment
                      </p>
                      <p>
                        Send proof of payment (screenshot) to customer care via:
                      </p>
                      <p className="font-bold text-premium-gold uppercase tracking-widest">
                        +234 900 000 0000 (WhatsApp)
                      </p>
                      <p className="text-[9px] uppercase tracking-widest text-gray-500 mt-2">
                        Include your name and Order ID: #
                        {order._id.slice(-6).toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            {/* Order Items */}
            <div className="space-y-6">
              <h2 className="text-[10px] uppercase tracking-widest font-bold text-premium-gold">
                Order Items
              </h2>
              <div className="space-y-4">
                {order.orderItems.map((item: any) => (
                  <div
                    key={item._id}
                    className="flex gap-4 border-b border-white/5 pb-4"
                  >
                    <div className="w-16 h-20 bg-premium-gray overflow-hidden">
                      <img
                        src={item.image}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold uppercase tracking-tight">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-gray-500 uppercase">
                        {item.size}
                      </p>
                      <p className="text-[10px] text-gray-500 uppercase">
                        {item.quantity} x ₦{item.price.toLocaleString()}
                      </p>
                    </div>
                    <p className="text-xs font-bold">
                      ₦{(item.quantity * item.price).toLocaleString()}
                    </p>
                  </div>
                ))}
                <div className="flex justify-between pt-2">
                  <p className="text-sm font-bold uppercase tracking-widest">
                    Total
                  </p>
                  <p className="text-xl font-bold text-premium-gold">
                    ₦{order.totalPrice.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="space-y-4 pt-8 border-t border-white/5">
              <h2 className="text-[10px] uppercase tracking-widest font-bold text-premium-gold">
                Delivery Destination
              </h2>
              <div className="text-sm text-gray-300 space-y-1">
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}
                </p>
                <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-widest">
                  Phone: {order.shippingAddress.phone}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrderDetailsPage;
