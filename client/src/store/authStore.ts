import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types";
import api from "../services/api";

interface AuthStore {
  userInfo: User | null;
  setUserInfo: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      userInfo: null,
      setUserInfo: (user) => set({ userInfo: user }),
      logout: () => {
        set({ userInfo: null });
        localStorage.removeItem("userInfo");
      },
    }),
    {
      name: "userInfo",
    },
  ),
);
