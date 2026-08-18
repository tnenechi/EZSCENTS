import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import request from "supertest";
import { startTestServer, stopTestServer, type TestServer } from "./testApp";
import Product from "../src/models/Product";
import Promotion from "../src/models/Promotion";

const deleteImage = vi.fn().mockResolvedValue(undefined);

// Never let a test hit the real Cloudinary account — assert on calls instead.
vi.mock("../src/services/cloudinaryService", () => ({
  uploadImage: vi.fn(),
  deleteImage: (publicId: string) => deleteImage(publicId),
  default: {},
}));

let server: TestServer;
let adminAgent: ReturnType<typeof request.agent>;

beforeAll(async () => {
  server = await startTestServer();
  adminAgent = request.agent(server.app);
  await adminAgent.post("/api/auth/register").send({
    name: "Admin",
    email: "admin@test.com", // matches ADMIN_EMAILS set in testApp.ts
    password: "password123",
  });
});

afterAll(async () => {
  await stopTestServer(server);
});

beforeEach(() => {
  deleteImage.mockClear();
});

describe("Cloudinary cleanup on product delete/update", () => {
  it("deletes every image's Cloudinary asset when a product is deleted", async () => {
    const product = await Product.create({
      name: "Test",
      brand: "Brand",
      description: "desc",
      category: "cat",
      images: [
        { url: "https://x/a.jpg", publicId: "a" },
        { url: "https://x/b.jpg", publicId: "b" },
      ],
      variants: [{ size: "50ml", price: 1000, stock: 1 }],
    });

    const res = await adminAgent.delete(`/api/products/${product._id}`);

    expect(res.status).toBe(200);
    expect(deleteImage).toHaveBeenCalledTimes(2);
    expect(deleteImage).toHaveBeenCalledWith("a");
    expect(deleteImage).toHaveBeenCalledWith("b");
  });

  it("only deletes images removed on update, leaving the rest alone", async () => {
    const product = await Product.create({
      name: "Test2",
      brand: "Brand",
      description: "desc",
      category: "cat",
      images: [
        { url: "https://x/a.jpg", publicId: "a" },
        { url: "https://x/b.jpg", publicId: "b" },
      ],
      variants: [{ size: "50ml", price: 1000, stock: 1 }],
    });

    const res = await adminAgent
      .put(`/api/products/${product._id}`)
      .send({ images: [{ url: "https://x/a.jpg", publicId: "a" }] });

    expect(res.status).toBe(200);
    expect(deleteImage).toHaveBeenCalledTimes(1);
    expect(deleteImage).toHaveBeenCalledWith("b");
  });
});

describe("Cloudinary cleanup on promotion delete/update", () => {
  it("deletes the image when a promotion is deleted", async () => {
    const promotion = await Promotion.create({
      title: "Promo",
      image: { url: "https://x/p.jpg", publicId: "p" },
    });

    const res = await adminAgent.delete(`/api/promotions/${promotion._id}`);

    expect(res.status).toBe(200);
    expect(deleteImage).toHaveBeenCalledWith("p");
  });

  it("deletes the old image when it's replaced on update", async () => {
    const promotion = await Promotion.create({
      title: "Promo2",
      image: { url: "https://x/old.jpg", publicId: "old" },
    });

    const res = await adminAgent
      .put(`/api/promotions/${promotion._id}`)
      .send({ image: { url: "https://x/new.jpg", publicId: "new" } });

    expect(res.status).toBe(200);
    expect(deleteImage).toHaveBeenCalledWith("old");
  });
});
