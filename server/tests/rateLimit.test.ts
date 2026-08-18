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

describe("Auth rate limiting", () => {
  it("returns 429 once the login attempt limit (10 / 15min) is exceeded", async () => {
    const attempt = () =>
      request(server.app)
        .post("/api/auth/login")
        .send({ email: "nope@test.com", password: "wrong" });

    const statuses: number[] = [];
    for (let i = 0; i < 11; i++) {
      const res = await attempt();
      statuses.push(res.status);
    }

    expect(statuses.slice(0, 10)).toEqual(Array(10).fill(401));
    expect(statuses[10]).toBe(429);
  });
});
