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
  link?: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  token: string;
}
