import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type{ Product, Variant } from '../types/index';

interface CartItem {
  product: Product;
  variant: Variant;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, variant: Variant, quantity: number) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, variant, quantity) => {
        const existingItem = get().items.find(
          (item) => item.product._id === product._id && item.variant._id === variant._id
        );

        if (existingItem) {
          set({
            items: get().items.map((item) =>
              item.product._id === product._id && item.variant._id === variant._id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({ items: [...get().items, { product, variant, quantity }] });
        }
      },
      removeItem: (productId, variantId) => {
        set({
          items: get().items.filter(
            (item) => !(item.product._id === productId && item.variant._id === variantId)
          ),
        });
      },
      updateQuantity: (productId, variantId, quantity) => {
        set({
          items: get().items.map((item) =>
            item.product._id === productId && item.variant._id === variantId
              ? { ...item, quantity }
              : item
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce((acc, item) => acc + item.variant.price * item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
