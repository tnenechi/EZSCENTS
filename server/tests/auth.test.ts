import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { startTestServer, stopTestServer, type TestServer } from "./testApp";

let server: TestServer;

beforeAll(async () => {
  server = await startTestServer();
});

afterAll(async () => {
  await stopTestServer(server);
});

describe("POST /api/auth/register", () => {
  it("rejects an invalid email", async () => {
    const res = await request(server.app).post("/api/auth/register").send({
      name: "Test",
      email: "not-an-email",
      password: "password123",
    });
    expect(res.status).toBe(400);
  });

  it("rejects a too-short password", async () => {
    const res = await request(server.app).post("/api/auth/register").send({
      name: "Test",
      email: "shortpass@test.com",
      password: "123",
    });
    expect(res.status).toBe(400);
  });

  it("grants the admin role automatically for an ADMIN_EMAILS address", async () => {
    const res = await request(server.app).post("/api/auth/register").send({
      name: "Admin",
      email: "admin@test.com", // matches ADMIN_EMAILS set in testApp.ts
      password: "password123",
    });
    expect(res.status).toBe(201);
    expect(res.body.role).toBe("admin");
  });

  it("defaults everyone else to the user role", async () => {
    const res = await request(server.app).post("/api/auth/register").send({
      name: "Regular",
      email: "regular@test.com",
      password: "password123",
    });
    expect(res.status).toBe(201);
    expect(res.body.role).toBe("user");
  });

  it("rejects registering the same email twice", async () => {
    const res = await request(server.app).post("/api/auth/register").send({
      name: "Regular Again",
      email: "regular@test.com",
      password: "password123",
    });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  it("logs in with correct credentials", async () => {
    const res = await request(server.app).post("/api/auth/login").send({
      email: "regular@test.com",
      password: "password123",
    });
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("regular@test.com");
  });

  it("rejects an incorrect password", async () => {
    const res = await request(server.app).post("/api/auth/login").send({
      email: "regular@test.com",
      password: "wrong-password",
    });
    expect(res.status).toBe(401);
  });
});
