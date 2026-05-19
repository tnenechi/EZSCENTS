export interface Variant {
  _id: string;
  size: string;
  price: number;
  stock: number;
}

export interface Product {
  _id: string;
  name: string;
  brand: string;
  description: string;
  category: string;
  images: string[];
  variants: Variant[];
  isFeatured: boolean;
  rating: number;
  numReviews: number;
  createdAt: string;
}

export interface Promotion {
  _id: string;
  title: string;
  description?: string;
  image: string;
  products?: string[];
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface ShippingAddress {
  address: string;
  city: string;
  state: string;
  phone: string;
}

export interface OrderItem {
  _id: string;
  name: string;
  quantity: number;
  image: string;
  price: number;
  product: string;
  variantId: string;
  size: string;
}

export interface Order {
  _id: string;
  user?: User;
  guestInfo?: {
    name: string;
    email: string;
  };
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
    reference?: string;
  };
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDispatched: boolean;
  dispatchedAt?: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
}
