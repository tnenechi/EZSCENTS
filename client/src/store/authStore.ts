import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types";
import api from "../services/api";
import { useCartStore } from "./cartStore";

interface AuthStore {
  userInfo: User | null;
  setUserInfo: (user: User | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      userInfo: null,
      setUserInfo: (user) => {
        // Before setting new user, save the current cart to its appropriate storage
        // The cartStore's persistCart helper uses userInfo from localStorage,
        // which currently still holds the OLD user (or guest).
        
        set({ userInfo: user });
        
        // Now load the NEW user's cart
        const cartKey = user ? `cart_${user._id}` : 'cart_guest';
        const savedCart = localStorage.getItem(cartKey);
        if (savedCart) {
          try {
            useCartStore.getState().setItems(JSON.parse(savedCart));
          } catch (e) {
            console.error('Error loading cart for user', e);
            useCartStore.getState().setItems([]);
          }
        } else {
          useCartStore.getState().setItems([]);
        }
      },
      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          console.error('Logout failed', error);
        } finally {
          // Setting to null will trigger the cart switch in a real app, 
          // but here we call it explicitly via setUserInfo(null) if needed, 
          // or just handle it here.
          
          set({ userInfo: null });
          
          // Load guest cart
          const savedCart = localStorage.getItem('cart_guest');
          if (savedCart) {
            try {
              useCartStore.getState().setItems(JSON.parse(savedCart));
            } catch {
              useCartStore.getState().setItems([]);
            }
          } else {
            useCartStore.getState().setItems([]);
          }
        }
      },
    }),
    {
      name: "userInfo",
    },
  ),
);
