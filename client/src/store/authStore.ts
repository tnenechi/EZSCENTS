import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types";
import api from "../services/api";

interface AuthStore {
  userInfo: User | null;
  setUserInfo: (user: User | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      userInfo: null,
      setUserInfo: (user) => set({ userInfo: user }),
      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          console.error('Logout failed', error);
        } finally {
          set({ userInfo: null });
        }
      },
    }),
    {
      name: "userInfo",
    },
  ),
);
