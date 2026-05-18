import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import connectDB from "./config/db";

dotenv.config();

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
// Session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "ezscents_secret_key",
    resave: false,
    saveUninitialized: false,
    proxy: true, // Required for secure cookies behind a proxy
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

app.get("/", (req, res) => {
  res.send("EzScents API is running...");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
