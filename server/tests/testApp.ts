import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import type { Express } from "express";

export interface TestServer {
  app: Express;
  mongod: MongoMemoryServer;
}

// Boots the real Express app (src/app.ts) against a throwaway in-memory
// MongoDB instance, so integration tests exercise real routes/middleware/
// Mongoose queries without touching the live Atlas cluster or requiring a
// real SESSION_SECRET/Cloudinary/Resend config. Env vars are set BEFORE
// dynamically importing app.ts, since app.ts reads them (and connects
// connect-mongo's session store) at module-load time.
export const startTestServer = async (): Promise<TestServer> => {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  process.env.MONGODB_URI = uri;
  process.env.SESSION_SECRET = "test-session-secret";
  process.env.NODE_ENV = "test";
  process.env.CLIENT_URL = "http://localhost:5173";
  process.env.ADMIN_EMAILS = "admin@test.com";
  // Force third-party integrations off — never hit real Cloudinary/Resend from tests.
  process.env.CLOUDINARY_API_KEY = "";
  process.env.CLOUDINARY_API_SECRET = "";
  process.env.RESEND_API_KEY = "";

  await mongoose.connect(uri);

  const { default: app } = await import("../src/app");
  return { app, mongod };
};

export const stopTestServer = async ({ mongod }: TestServer) => {
  await mongoose.disconnect();
  await mongod.stop();
};
