import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "./cartStore";
import type { Product, Variant } from "../types";

const variantA: Variant = { _id: "v1", size: "50ml", price: 1000, stock: 5 };
const variantB: Variant = { _id: "v2", size: "100ml", price: 1800, stock: 5 };

const product: Product = {
  _id: "p1",
  name: "Test Scent",
  brand: "Test Brand",
  description: "desc",
  category: "cat",
  images: [],
  variants: [variantA, variantB],
  isFeatured: false,
  rating: 0,
  numReviews: 0,
  createdAt: new Date().toISOString(),
};

beforeEach(() => {
  localStorage.clear();
  useCartStore.setState({ items: [] });
});

describe("cartStore", () => {
  it("adds a new item and persists it under the guest cart key", () => {
    useCartStore.getState().addItem(product, variantA, 1);

    expect(useCartStore.getState().items).toHaveLength(1);
    const saved = JSON.parse(localStorage.getItem("cart_guest") || "[]");
    expect(saved).toHaveLength(1);
    expect(saved[0].variant._id).toBe("v1");
  });

  it("merges quantity when the same product+variant is added again", () => {
    useCartStore.getState().addItem(product, variantA, 1);
    useCartStore.getState().addItem(product, variantA, 2);

    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(3);
  });

  it("keeps different variants of the same product as separate line items", () => {
    useCartStore.getState().addItem(product, variantA, 1);
    useCartStore.getState().addItem(product, variantB, 1);

    expect(useCartStore.getState().items).toHaveLength(2);
  });

  it("removes only the matching product+variant", () => {
    useCartStore.getState().addItem(product, variantA, 1);
    useCartStore.getState().addItem(product, variantB, 1);

    useCartStore.getState().removeItem(product._id, variantA._id);

    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].variant._id).toBe("v2");
  });

  it("updates quantity for the matching line item", () => {
    useCartStore.getState().addItem(product, variantA, 1);
    useCartStore.getState().updateQuantity(product._id, variantA._id, 5);

    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it("computes the total across quantities and variant prices", () => {
    useCartStore.getState().addItem(product, variantA, 2); // 1000 * 2
    useCartStore.getState().addItem(product, variantB, 1); // 1800 * 1

    expect(useCartStore.getState().getTotal()).toBe(3800);
  });

  it("clearCart empties items and persists the empty cart", () => {
    useCartStore.getState().addItem(product, variantA, 1);
    useCartStore.getState().clearCart();

    expect(useCartStore.getState().items).toHaveLength(0);
    expect(JSON.parse(localStorage.getItem("cart_guest") || "[]")).toHaveLength(0);
  });

  it("persists under the logged-in user's cart key when userInfo is present", () => {
    localStorage.setItem(
      "userInfo",
      JSON.stringify({ state: { userInfo: { _id: "user42" } } }),
    );

    useCartStore.getState().addItem(product, variantA, 1);

    expect(localStorage.getItem("cart_guest")).toBeNull();
    const saved = JSON.parse(localStorage.getItem("cart_user42") || "[]");
    expect(saved).toHaveLength(1);
  });

  it("setItems replaces the in-memory cart without writing to localStorage", () => {
    useCartStore.getState().setItems([{ product, variant: variantA, quantity: 1 }]);

    expect(useCartStore.getState().items).toHaveLength(1);
    expect(localStorage.getItem("cart_guest")).toBeNull();
  });
});
