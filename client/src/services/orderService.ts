import api from "./api";
import type { Order, OrderItem, ShippingAddress } from "../types";

export interface OrderData {
  orderItems: Omit<OrderItem, "_id">[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  totalPrice: number;
  guestInfo?: {
    name: string;
    email: string;
  };
}

export const createOrder = async (order: OrderData): Promise<Order> => {
  const { data } = await api.post<Order>("/orders", order);
  return data;
};

export const getOrderDetails = async (
  id: string,
  guestEmail?: string,
): Promise<Order> => {
  const { data } = await api.get<Order>(`/orders/${id}`, {
    params: guestEmail ? { email: guestEmail } : undefined,
  });
  return data;
};

export const payOrder = async (
  id: string,
  paymentResult: Record<string, unknown>,
): Promise<Order> => {
  const { data } = await api.put<Order>(`/orders/${id}/pay`, paymentResult);
  return data;
};

export const getMyOrders = async (): Promise<Order[]> => {
  const { data } = await api.get<Order[]>("/orders/myorders");
  return data;
};

// Admin methods
export const getAllOrders = async (params?: {
  keyword?: string;
  isPaid?: string;
  isDispatched?: string;
  status?: string;
  pageNumber?: number;
}): Promise<{
  orders: Order[];
  page: number;
  pages: number;
  count: number;
}> => {
  const { data } = await api.get("/orders", { params });
  return data as {
    orders: Order[];
    page: number;
    pages: number;
    count: number;
  };
};

export const updateOrderToDispatched = async (id: string): Promise<Order> => {
  const { data } = await api.put<Order>(`/orders/${id}/deliver`);
  return data;
};

export const deleteOrder = async (id: string) => {
  const { data } = await api.delete(`/orders/${id}`);
  return data;
};

export const deleteOrders = async (ids: string[]) => {
  const { data } = await api.delete("/orders", { data: { ids } });
  return data;
};
