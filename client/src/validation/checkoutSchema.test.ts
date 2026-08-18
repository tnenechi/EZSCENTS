import { describe, it, expect } from "vitest";
import { shippingSchema } from "./checkoutSchema";

const validBase = {
  address: "123 Main Street",
  city: "Lagos",
  state: "Lagos",
  phone: "08012345678",
};

describe("shippingSchema", () => {
  it("accepts a valid logged-in-user submission with no guest fields", () => {
    const result = shippingSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it("accepts an empty guestEmail string (logged-in users don't fill it)", () => {
    const result = shippingSchema.safeParse({ ...validBase, guestEmail: "" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid guestEmail", () => {
    const result = shippingSchema.safeParse({
      ...validBase,
      guestEmail: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid guestEmail", () => {
    const result = shippingSchema.safeParse({
      ...validBase,
      guestEmail: "guest@example.com",
      guestName: "Guest User",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a too-short address", () => {
    const result = shippingSchema.safeParse({ ...validBase, address: "Rd" });
    expect(result.success).toBe(false);
  });

  it("rejects a too-short phone number", () => {
    const result = shippingSchema.safeParse({ ...validBase, phone: "123" });
    expect(result.success).toBe(false);
  });
});
