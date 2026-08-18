import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { startTestServer, stopTestServer, type TestServer } from "./testApp";
import Product from "../src/models/Product";

let server: TestServer;
let adminAgent: ReturnType<typeof request.agent>;
let ownerAgent: ReturnType<typeof request.agent>;
let otherAgent: ReturnType<typeof request.agent>;
let productId: string;
let variantId: string;

const shippingAddress = {
  address: "1 Test Street",
  city: "Lagos",
  state: "Lagos",
  phone: "08000000000",
};

const orderPayload = () => ({
  orderItems: [
    {
      product: productId,
      variantId,
      quantity: 1,
      name: "x",
      image: "x",
      price: 1,
      size: "50ml",
    },
  ],
  shippingAddress,
  paymentMethod: "Bank Transfer",
});

beforeAll(async () => {
  server = await startTestServer();

  adminAgent = request.agent(server.app);
  await adminAgent.post("/api/auth/register").send({
    name: "Admin",
    email: "admin@test.com", // matches ADMIN_EMAILS set in testApp.ts
    password: "password123",
  });

  ownerAgent = request.agent(server.app);
  await ownerAgent.post("/api/auth/register").send({
    name: "Owner",
    email: "owner@test.com",
    password: "password123",
  });

  otherAgent = request.agent(server.app);
  await otherAgent.post("/api/auth/register").send({
    name: "Other",
    email: "other@test.com",
    password: "password123",
  });

  const product = await Product.create({
    name: "Test Perfume",
    brand: "Test Brand",
    description: "desc",
    category: "cat",
    images: [{ url: "https://example.com/x.jpg", publicId: "x" }],
    variants: [{ size: "50ml", price: 10000, stock: 5 }],
  });
  productId = product._id.toString();
  variantId = product.variants[0]._id!.toString();
});

afterAll(async () => {
  await stopTestServer(server);
});

describe("Order ownership (IDOR guard)", () => {
  it("lets the owner view their own order", async () => {
    const created = await ownerAgent.post("/api/orders").send(orderPayload());
    const res = await ownerAgent.get(`/api/orders/${created.body._id}`);
    expect(res.status).toBe(200);
  });

  it("blocks a different logged-in user from viewing someone else's order", async () => {
    const created = await ownerAgent.post("/api/orders").send(orderPayload());
    const res = await otherAgent.get(`/api/orders/${created.body._id}`);
    expect(res.status).toBe(403);
  });

  it("lets an admin view any order", async () => {
    const created = await ownerAgent.post("/api/orders").send(orderPayload());
    const res = await adminAgent.get(`/api/orders/${created.body._id}`);
    expect(res.status).toBe(200);
  });

  it("gates a guest order behind a matching ?email=, not just the order ID", async () => {
    const created = await request(server.app)
      .post("/api/orders")
      .send({
        ...orderPayload(),
        guestInfo: { name: "Guest", email: "guest@test.com" },
      });
    const orderId = created.body._id;

    const noAuth = await request(server.app).get(`/api/orders/${orderId}`);
    expect(noAuth.status).toBe(403);

    const wrongEmail = await request(server.app).get(
      `/api/orders/${orderId}?email=someone-else@test.com`,
    );
    expect(wrongEmail.status).toBe(403);

    const rightEmail = await request(server.app).get(
      `/api/orders/${orderId}?email=guest@test.com`,
    );
    expect(rightEmail.status).toBe(200);
  });

  it("404s for an order that doesn't exist", async () => {
    const res = await adminAgent.get("/api/orders/000000000000000000000000");
    expect(res.status).toBe(404);
  });
});

describe("PUT /api/orders/:id/pay - admin only", () => {
  it("blocks a non-admin logged-in user (even the order's own owner)", async () => {
    const created = await ownerAgent.post("/api/orders").send(orderPayload());
    const res = await ownerAgent
      .put(`/api/orders/${created.body._id}/pay`)
      .send({});
    expect(res.status).toBe(401);
  });

  it("allows an admin to mark an order as paid", async () => {
    const created = await ownerAgent.post("/api/orders").send(orderPayload());
    const res = await adminAgent
      .put(`/api/orders/${created.body._id}/pay`)
      .send({});
    expect(res.status).toBe(200);
    expect(res.body.isPaid).toBe(true);
  });
});
