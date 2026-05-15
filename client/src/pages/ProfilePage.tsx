import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  User as UserIcon,
  ShoppingBag,
  Lock,
  ChevronRight,
  CheckCircle2,
  Clock,
  Truck,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { getMyOrders } from "../services/orderService";
import { changePassword } from "../services/authService";
import MainLayout from "../components/layout/MainLayout";
import { Link } from "react-router-dom";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<"orders" | "security">("orders");
  const { userInfo } = useAuthStore();

  const { data: orders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["my-orders"],
    queryFn: getMyOrders,
    enabled: !!userInfo,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStatus, setPasswordStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const changePasswordMutation = useMutation({
    mutationFn: () =>
      changePassword(passwordData.currentPassword, passwordData.newPassword),
    onSuccess: () => {
      setPasswordStatus({
        type: "success",
        message: "Password updated successfully",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error: any) => {
      setPasswordStatus({
        type: "error",
        message: error.response?.data?.message || "Failed to update password",
      });
    },
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordStatus({ type: "error", message: "Passwords do not match" });
      return;
    }
    changePasswordMutation.mutate();
  };

  const tabs = [
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "security", label: "Security", icon: Lock },
  ];

  return (
    <MainLayout showSidebar={false}>
      <div className="max-w-6xl mx-auto py-8">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Profile Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-premium-gray/20 border border-white/5 p-8 rounded-sm mb-8">
              <div className="w-16 h-16 bg-premium-gold/10 border border-premium-gold/20 rounded-full flex items-center justify-center text-premium-gold mb-4 mx-auto md:mx-0">
                <UserIcon size={32} />
              </div>
              <h1 className="text-xl font-bold tracking-tight uppercase mb-1 text-white">
                {userInfo?.name}
              </h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                {userInfo?.email}
              </p>
            </div>

            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center justify-between p-4 text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm ${
                    activeTab === tab.id
                      ? "bg-premium-gold text-black"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon size={18} />
                    {tab.label}
                  </div>
                  {activeTab === tab.id && <ChevronRight size={14} />}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1 min-h-[600px]">
            <AnimatePresence mode="wait">
              {activeTab === "orders" && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-end mb-8">
                    <div>
                      <h2 className="text-[10px] uppercase tracking-[0.4em] text-premium-gold mb-2 font-bold">
                        Account
                      </h2>
                      <h3 className="text-3xl font-bold uppercase tracking-tight text-white">
                        Your Orders
                      </h3>
                    </div>
                  </div>

                  {isLoadingOrders ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                      <Loader2
                        className="animate-spin text-premium-gold"
                        size={32}
                      />
                      <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">
                        Loading your orders...
                      </p>
                    </div>
                  ) : orders?.length === 0 ? (
                    <div className="text-center py-20 border border-white/5 bg-premium-gray/10 rounded-sm">
                      <ShoppingBag
                        className="mx-auto text-gray-600 mb-4"
                        size={48}
                      />
                      <p className="text-gray-400 uppercase text-[10px] tracking-widest font-bold">
                        No orders found yet
                      </p>
                      <Link
                        to="/shop"
                        className="mt-6 inline-block text-premium-gold border-b border-premium-gold text-[10px] font-bold uppercase tracking-widest pb-1"
                      >
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders?.map((order: any) => (
                        <div
                          key={order._id}
                          className="bg-premium-gray/10 border border-white/5 p-8 hover:border-premium-gold/30 transition-colors rounded-sm group"
                        >
                          <div className="flex flex-wrap justify-between items-center gap-6 mb-8">
                            <div className="space-y-1">
                              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                                Order ID: #{order._id.slice(-6).toUpperCase()}
                              </p>
                              <p className="text-sm font-bold text-white">
                                {new Date(order.createdAt).toLocaleDateString()}{" "}
                                — ₦{order.totalPrice.toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div
                                className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                                  order.isPaid
                                    ? "bg-green-500/10 text-green-500"
                                    : "bg-yellow-500/10 text-yellow-500"
                                }`}
                              >
                                {order.isPaid ? (
                                  <CheckCircle2 size={12} />
                                ) : (
                                  <Clock size={12} />
                                )}
                                {order.isPaid ? "Paid" : "Awaiting Payment"}
                              </div>
                              <Link
                                to={`/order/${order._id}`}
                                className="text-premium-gold hover:text-white transition-colors flex items-center gap-2 text-[9px] uppercase font-bold tracking-widest group-hover:translate-x-1 transition-transform"
                              >
                                Details <ChevronRight size={16} />
                              </Link>
                            </div>
                          </div>

                          {/* Item Preview */}
                          <div className="flex gap-4 overflow-x-auto pb-6 border-b border-white/5 mb-8">
                            {order.orderItems.map((item: any, idx: number) => (
                              <div
                                key={idx}
                                className="w-14 h-14 bg-premium-gray shrink-0 border border-white/5 rounded-sm overflow-hidden"
                              >
                                <img
                                  src={item.image}
                                  alt=""
                                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                                  title={item.name}
                                />
                              </div>
                            ))}
                          </div>

                          {/* Order Journey / Tracking Preview */}
                          <div className="space-y-6">
                            <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-premium-gold">
                              Tracking Status
                            </p>
                            <div className="relative flex justify-between px-4 max-w-lg">
                              <div className="absolute top-[14px] left-0 w-full h-[1px] bg-white/10 -z-10" />

                              <div className="flex flex-col items-center gap-3 bg-premium-black px-2">
                                <div className="w-7 h-7 rounded-full border border-premium-gold flex items-center justify-center text-premium-gold bg-premium-gold/5 shadow-[0_0_10px_rgba(212,175,55,0.1)]">
                                  <CheckCircle2 size={14} />
                                </div>
                                <span className="text-[8px] uppercase tracking-widest font-bold text-white">
                                  Placed
                                </span>
                              </div>

                              <div
                                className={`flex flex-col items-center gap-3 bg-premium-black px-2 ${order.isPaid ? "text-premium-gold" : "text-gray-600"}`}
                              >
                                <div
                                  className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${order.isPaid ? "border-premium-gold bg-premium-gold/5 shadow-[0_0_10px_rgba(212,175,55,0.1)]" : "border-white/10"}`}
                                >
                                  {order.isPaid ? (
                                    <CheckCircle2 size={14} />
                                  ) : (
                                    <Clock size={14} />
                                  )}
                                </div>
                                <span
                                  className={`text-[8px] uppercase tracking-widest font-bold ${order.isPaid ? "text-white" : "text-gray-600"}`}
                                >
                                  Paid
                                </span>
                              </div>

                              <div
                                className={`flex flex-col items-center gap-3 bg-premium-black px-2 ${order.isDelivered ? "text-premium-gold" : "text-gray-600"}`}
                              >
                                <div
                                  className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${order.isDelivered ? "border-premium-gold bg-premium-gold/5 shadow-[0_0_10px_rgba(212,175,55,0.1)]" : "border-white/10"}`}
                                >
                                  {order.isDelivered ? (
                                    <CheckCircle2 size={14} />
                                  ) : (
                                    <Truck size={14} />
                                  )}
                                </div>
                                <span
                                  className={`text-[8px] uppercase tracking-widest font-bold ${order.isDelivered ? "text-white" : "text-gray-600"}`}
                                >
                                  Arrived
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "security" && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-[10px] uppercase tracking-[0.4em] text-premium-gold mb-2 font-bold">
                      Protection
                    </h2>
                    <h3 className="text-3xl font-bold uppercase tracking-tight text-white">
                      Security Settings
                    </h3>
                  </div>

                  <form
                    onSubmit={handlePasswordChange}
                    className="bg-premium-gray/20 border border-white/5 p-8 rounded-sm space-y-6 max-w-xl"
                  >
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">
                      Change Password
                    </h4>

                    {passwordStatus && (
                      <div
                        className={`p-4 flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold ${
                          passwordStatus.type === "success"
                            ? "bg-green-500/10 text-green-500 border border-green-500/20"
                            : "bg-red-500/10 text-red-500 border border-red-500/20"
                        }`}
                      >
                        {passwordStatus.type === "success" ? (
                          <CheckCircle2 size={16} />
                        ) : (
                          <AlertCircle size={16} />
                        )}
                        {passwordStatus.message}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">
                        Current Password
                      </label>
                      <input
                        required
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        className="w-full bg-black/50 border border-white/10 px-4 py-3 text-sm focus:border-premium-gold outline-none text-white transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">
                        New Password
                      </label>
                      <input
                        required
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        className="w-full bg-black/50 border border-white/10 px-4 py-3 text-sm focus:border-premium-gold outline-none text-white transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">
                        Confirm New Password
                      </label>
                      <input
                        required
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full bg-black/50 border border-white/10 px-4 py-3 text-sm focus:border-premium-gold outline-none text-white transition-colors"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={changePasswordMutation.isPending}
                      className="w-full bg-white text-black py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-premium-gold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {changePasswordMutation.isPending ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        "Update Password"
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
