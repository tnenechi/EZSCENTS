import { describe, it, expect } from "vitest";
import { buildOrderTrackingPath } from "./orderTracking";

describe("buildOrderTrackingPath", () => {
  it("links straight to the order when there is no guest email (logged-in user)", () => {
    expect(buildOrderTrackingPath("order123")).toBe("/order/order123");
  });

  it("appends the guest email as a query param for guest checkouts", () => {
    expect(buildOrderTrackingPath("order123", "guest@example.com")).toBe(
      "/order/order123?email=guest%40example.com",
    );
  });

  it("URL-encodes special characters in the guest email", () => {
    expect(buildOrderTrackingPath("order123", "a+b@example.com")).toBe(
      "/order/order123?email=a%2Bb%40example.com",
    );
  });
});
