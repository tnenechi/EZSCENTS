import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAuthStore } from "./authStore";
import { useCartStore } from "./cartStore";
import api from "../services/api";
import type { User } from "../types";

vi.mock("../services/api", () => ({
  default: { post: vi.fn().mockResolvedValue({ data: {} }) },
}));

const user: User = {
  _id: "user42",
  name: "Test User",
  email: "user@example.com",
  role: "user",
};

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ userInfo: null });
  useCartStore.setState({ items: [] });
  vi.mocked(api.post).mockClear();
});

describe("authStore.setUserInfo", () => {
  it("sets userInfo and loads that user's saved cart", () => {
    localStorage.setItem(
      "cart_user42",
      JSON.stringify([
        {
          product: { _id: "p1", variants: [] },
          variant: { _id: "v1", size: "50ml", price: 1000, stock: 1 },
          quantity: 2,
        },
      ]),
    );

    useAuthStore.getState().setUserInfo(user);

    expect(useAuthStore.getState().userInfo).toEqual(user);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });

  it("defaults to an empty cart when the user has no saved cart", () => {
    useAuthStore.getState().setUserInfo(user);

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("loads the guest cart when setUserInfo(null) is called", () => {
    localStorage.setItem(
      "cart_guest",
      JSON.stringify([
        {
          product: { _id: "p1", variants: [] },
          variant: { _id: "v1", size: "50ml", price: 1000, stock: 1 },
          quantity: 1,
        },
      ]),
    );

    useAuthStore.getState().setUserInfo(null);

    expect(useAuthStore.getState().userInfo).toBeNull();
    expect(useCartStore.getState().items).toHaveLength(1);
  });
});

describe("authStore.logout", () => {
  it("calls the logout endpoint, clears userInfo, and reloads the guest cart", async () => {
    useAuthStore.setState({ userInfo: user });

    await useAuthStore.getState().logout();

    expect(api.post).toHaveBeenCalledWith("/auth/logout");
    expect(useAuthStore.getState().userInfo).toBeNull();
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("still clears local session state even if the logout request fails", async () => {
    vi.mocked(api.post).mockRejectedValueOnce(new Error("network error"));
    useAuthStore.setState({ userInfo: user });

    await useAuthStore.getState().logout();

    expect(useAuthStore.getState().userInfo).toBeNull();
  });
});
