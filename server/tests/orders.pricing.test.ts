import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { startTestServer, stopTestServer, type TestServer } from "./testApp";
import Product from "../src/models/Product";

let server: TestServer;

beforeAll(async () => {
  server = await startTestServer();
});

afterAll(async () => {
  await stopTestServer(server);
});

const shippingAddress = {
  address: "1 Test Street",
  city: "Lagos",
  state: "Lagos",
  phone: "08000000000",
};

describe("POST /api/orders - price integrity", () => {
  it("recomputes price/total from the database, ignoring client-supplied values", async () => {
    const product = await Product.create({
      name: "Test Perfume",
      brand: "Test Brand",
      description: "desc",
      category: "cat",
      images: [{ url: "https://example.com/x.jpg", publicId: "x" }],
      variants: [{ size: "50ml", price: 60000, stock: 10 }],
    });
    const variantId = product.variants[0]._id!.toString();

    const res = await request(server.app)
      .post("/api/orders")
      .send({
        orderItems: [
          {
            product: product._id.toString(),
            variantId,
            quantity: 2,
            name: "TAMPERED NAME",
            image: "https://evil.example/fake.jpg",
            price: 1,
            size: "50ml",
          },
        ],
        shippingAddress,
        paymentMethod: "Bank Transfer",
        guestInfo: { name: "Guest", email: "guest@test.com" },
      });

    expect(res.status).toBe(201);
    expect(res.body.totalPrice).toBe(120000);
    expect(res.body.orderItems[0].price).toBe(60000);
    expect(res.body.orderItems[0].name).toBe("Test Perfume");
    expect(res.body.orderItems[0].image).toBe("https://example.com/x.jpg");
  });

  it("rejects an order referencing a nonexistent product/variant", async () => {
    const res = await request(server.app)
      .post("/api/orders")
      .send({
        orderItems: [
          {
            product: "000000000000000000000000",
            variantId: "000000000000000000000000",
            quantity: 1,
            name: "x",
            image: "x",
            price: 1,
            size: "x",
          },
        ],
        shippingAddress,
        paymentMethod: "Bank Transfer",
        guestInfo: { name: "Guest", email: "guest@test.com" },
      });

    expect(res.status).toBe(400);
  });

  it("still creates an order for a product with no images (no server crash)", async () => {
    const product = await Product.create({
      name: "Imageless Perfume",
      brand: "Test Brand",
      description: "desc",
      category: "cat",
      images: [],
      variants: [{ size: "30ml", price: 5000, stock: 10 }],
    });
    const variantId = product.variants[0]._id!.toString();

    const res = await request(server.app)
      .post("/api/orders")
      .send({
        orderItems: [
          {
            product: product._id.toString(),
            variantId,
            quantity: 1,
            name: "x",
            image: "x",
            price: 1,
            size: "30ml",
          },
        ],
        shippingAddress,
        paymentMethod: "Bank Transfer",
        guestInfo: { name: "Guest", email: "guest@test.com" },
      });

    expect(res.status).toBe(201);
    expect(res.body.orderItems[0].image).toBe("");
  });

  it("rejects a malformed request body before it reaches the controller", async () => {
    const res = await request(server.app)
      .post("/api/orders")
      .send({ orderItems: [] });

    expect(res.status).toBe(400);
  });
});
