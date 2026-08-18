import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import MongoStore from "connect-mongo";
import { enforceJson } from "./middleware/enforceJson";
import { notFound, errorHandler } from "./middleware/errorHandler";

dotenv.config();

if (!process.env.SESSION_SECRET) {
  throw new Error(
    "SESSION_SECRET environment variable is required and must be set in production.",
  );
}

const app = express();
app.set("trust proxy", 1);

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(enforceJson);
// Session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || "mongodb://localhost:27017/ezscents",
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  }),
);

// Routes
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import promotionRoutes from "./routes/promotionRoutes";
import orderRoutes from "./routes/orderRoutes";
import uploadRoutes from "./routes/uploadRoutes";

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/", (_req, res) => {
  res.send("EzScents API is running...");
});

app.use(notFound);
app.use(errorHandler);

export default app;
