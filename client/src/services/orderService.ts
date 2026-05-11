import api from './api';

export interface ShippingAddress {
  address: string;
  city: string;
  state: string;
  phone: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  image: string;
  price: number;
  product: string;
  variantId: string;
  size: string;
}

export interface OrderData {
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  totalPrice: number;
  guestInfo?: {
    name: string;
    email: string;
  };
}

export const createOrder = async (order: OrderData) => {
  const { data } = await api.post('/orders', order);
  return data;
};

export const getOrderDetails = async (id: string) => {
  const { data } = await api.get(`/orders/${id}`);
  return data;
};

export const payOrder = async (id: string, paymentResult: any) => {
  const { data } = await api.put(`/orders/${id}/pay`, paymentResult);
  return data;
};

export const getMyOrders = async () => {
  const { data } = await api.get('/orders/myorders');
  return data;
};

// Admin methods
export const getAllOrders = async () => {
  const { data } = await api.get('/orders');
  return data;
};

export const updateOrderToDelivered = async (id: string) => {
  const { data } = await api.put(`/orders/${id}/deliver`);
  return data;
};
