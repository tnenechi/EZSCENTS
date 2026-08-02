import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
// import type { UseQueryOptions } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock, Eye, Search, Filter, X } from "lucide-react";
import { getAllOrders } from "../../services/orderService";
import AdminLayout from "../../components/layout/AdminLayout";
import TableSkeleton from "../../components/common/TableSkeleton";
import type { Order } from "../../types";

const AdminOrderListPage = () => {
  const [keyword, setKeyword] = useState("");
  const [isPaid, setIsPaid] = useState("");
  const [status, setStatus] = useState("");
  const [pageNumber, setPageNumber] = useState(1);

  const { data, isLoading, error } = useQuery<{
    orders: Order[];
    page: number;
    pages: number;
    count: number;
  }>({
    queryKey: ["admin-orders", keyword, isPaid, status, pageNumber],
    queryFn: () => getAllOrders({ keyword, isPaid, status, pageNumber }),
    placeholderData: (previousData) => previousData,
  });

  const clearFilters = () => {
    setKeyword("");
    setIsPaid("");
    setStatus("");
    setPageNumber(1);
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 pb-6 border-b border-premium-border/10 gap-6">
        <div>
          <h2 className="text-[10px] uppercase tracking-[0.4em] text-premium-gold mb-2 font-bold">
            Sales & Fulfillment
          </h2>
          <h1 className="text-4xl font-bold tracking-tight uppercase">
            Customer Orders
          </h1>
        </div>
        <div className="text-right flex items-end gap-8">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-premium-muted-light mb-1 font-bold">
              Total Orders
            </p>
            <p className="text-2xl font-bold">
              {data?.count ?? data?.orders.length ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="relative col-span-1 md:col-span-2">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-premium-muted-light"
            size={16}
          />
          <input
            type="text"
            placeholder="Search Order ID, Customer Name or Email..."
            className="w-full bg-premium-gray border border-premium-border/30 rounded-sm py-2.5 pl-10 pr-4 text-xs font-bold focus:outline-none focus:border-premium-gold transition-colors"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPageNumber(1);
            }}
          />
        </div>

        <div className="relative">
          <Filter
            className="absolute left-3 top-1/2 -translate-y-1/2 text-premium-muted-light"
            size={14}
          />
          <select
            className="w-full bg-premium-gray border border-premium-border/30 rounded-sm py-2.5 pl-9 pr-4 text-[10px] uppercase font-bold tracking-widest focus:outline-none focus:border-premium-gold transition-colors appearance-none"
            value={isPaid}
            onChange={(e) => {
              setIsPaid(e.target.value);
              setPageNumber(1);
            }}
          >
            <option value="" className="bg-background">
              Payment: All
            </option>
            <option value="true" className="bg-background">
              Paid
            </option>
            <option value="false" className="bg-background">
              Pending
            </option>
          </select>
        </div>

        <div className="relative">
          <Filter
            className="absolute left-3 top-1/2 -translate-y-1/2 text-premium-muted-light"
            size={14}
          />
          <select
            className="w-full bg-premium-gray border border-premium-border/30 rounded-sm py-2.5 pl-9 pr-4 text-[10px] uppercase font-bold tracking-widest focus:outline-none focus:border-premium-gold transition-colors appearance-none"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPageNumber(1);
            }}
          >
            <option value="" className="bg-background">
              Delivery: All
            </option>
            <option value="Processing" className="bg-background">
              Processing
            </option>
            <option value="Shipped" className="bg-background">
              Dispatched
            </option>
          </select>
        </div>
      </div>

      {(keyword || isPaid || status) && (
        <div className="flex justify-end mb-6">
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-premium-gold hover:text-foreground transition-colors"
          >
            <X size={14} /> Clear Filters
          </button>
        </div>
      )}

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 p-8 text-center">
          <p className="text-red-500 text-xs uppercase tracking-widest font-bold">
            Failed to load orders.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-premium-border/10 text-[10px] uppercase tracking-widest text-premium-muted-light font-bold">
                <th className="py-4 pr-4">Order ID</th>
                <th className="py-4 px-4">Customer</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4">Total</th>
                <th className="py-4 px-4">Paid</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-premium-border/10">
              {data?.orders.map((order) => (
                <tr
                  key={order._id}
                  className="group hover:bg-premium-gray transition-colors"
                >
                  <td className="py-5 pr-4">
                    <span className="text-xs font-mono text-premium-muted font-bold">
                      #{order._id.slice(-6).toUpperCase()}
                    </span>
                  </td>
                  <td className="py-5 px-4">
                    <p className="text-xs font-bold uppercase tracking-tight text-foreground">
                      {order.user?.name || order.guestInfo?.name || "Guest"}
                    </p>
                    <p className="text-[10px] text-premium-muted-light truncate max-w-[150px] font-bold">
                      {order.user?.email || order.guestInfo?.email}
                    </p>
                  </td>
                  <td className="py-5 px-4">
                    <p className="text-[10px] uppercase text-premium-muted font-bold">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="py-5 px-4 font-bold text-xs text-foreground">
                    ₦{order.totalPrice.toLocaleString()}
                  </td>
                  <td className="py-5 px-4">
                    {order.isPaid ? (
                      <span className="flex items-center gap-1 text-green-500 text-[9px] uppercase font-bold tracking-widest">
                        <CheckCircle2 size={12} />{" "}
                        {order.paidAt
                          ? new Date(order.paidAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-500 text-[9px] uppercase font-bold tracking-widest">
                        <Clock size={12} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="py-5 px-4">
                    {order.isDispatched ? (
                      <span className="flex items-center gap-1 text-premium-gold text-[9px] uppercase font-bold tracking-widest">
                        <CheckCircle2 size={12} /> Dispatched
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-premium-muted text-[9px] uppercase font-bold tracking-widest">
                        <Clock size={12} /> {order.status}
                      </span>
                    )}
                  </td>
                  <td className="py-5 pl-4 text-right">
                    <Link
                      to={`/order/${order._id}`}
                      className="inline-flex items-center gap-2 bg-premium-gray/20 hover:bg-premium-black text-premium-muted hover:text-white p-2 rounded-sm transition-all"
                    >
                      <Eye size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data?.orders.length === 0 && (
            <div className="py-20 text-center border border-dashed border-premium-border/20 mt-4">
              <p className="text-premium-muted-light uppercase tracking-widest text-[10px] font-bold">
                No orders found in database.
              </p>
            </div>
          )}
          {data && data.pages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              {[...Array(data.pages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPageNumber(i + 1)}
                  className={`w-9 h-9 text-[10px] font-bold border transition-all ${
                    data.page === i + 1
                      ? "bg-premium-gold border-premium-gold text-premium-black"
                      : "border-premium-border/20 text-premium-muted hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrderListPage;
