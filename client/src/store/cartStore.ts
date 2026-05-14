import { create } from 'zustand';
import type { Product, Variant } from '../types/index';

export interface CartItem {
  product: Product;
  variant: Variant;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, variant: Variant, quantity: number) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  setItems: (items: CartItem[]) => void;
  clearCart: () => void;
  getTotal: () => number;
}

// Helper to save to localStorage based on user status
const persistCart = (items: CartItem[]) => {
  const authData = localStorage.getItem('userInfo');
  let userId = 'guest';
  
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      if (parsed.state?.userInfo?._id) {
        userId = parsed.state.userInfo._id;
      }
    } catch (e) {
      console.error('Error parsing auth data for cart persistence', e);
    }
  }
  
  localStorage.setItem(`cart_${userId}`, JSON.stringify(items));
};

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (product, variant, quantity) => {
    const existingItem = get().items.find(
      (item) => item.product._id === product._id && item.variant._id === variant._id
    );

    let newItems;
    if (existingItem) {
      newItems = get().items.map((item) =>
        item.product._id === product._id && item.variant._id === variant._id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newItems = [...get().items, { product, variant, quantity }];
    }
    set({ items: newItems });
    persistCart(newItems);
  },
  removeItem: (productId, variantId) => {
    const newItems = get().items.filter(
      (item) => !(item.product._id === productId && item.variant._id === variantId)
    );
    set({ items: newItems });
    persistCart(newItems);
  },
  updateQuantity: (productId, variantId, quantity) => {
    const newItems = get().items.map((item) =>
      item.product._id === productId && item.variant._id === variantId
        ? { ...item, quantity }
        : item
    );
    set({ items: newItems });
    persistCart(newItems);
  },
  setItems: (items) => {
    set({ items });
    // Note: We don't automatically persist on setItems because it's often used during loading
  },
  clearCart: () => {
    set({ items: [] });
    persistCart([]);
  },
  getTotal: () => {
    return get().items.reduce((acc, item) => acc + item.variant.price * item.quantity, 0);
  },
}));
