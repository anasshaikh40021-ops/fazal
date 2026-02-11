import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/mongodb.js";
import { connectCloudinary } from "./config/cloudinary.js";

import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import reviewRoutes from "./routes/reviewRoutes.js";

const app = express();
const port = process.env.PORT || 4000;

/* ======================
   CORS (Node 24 SAFE)
====================== */
app.use(
  cors({
    origin: [
      "http://localhost:5174", // Vite dev
      "http://localhost:5173",
      "https://fazal-frontend-topaz.vercel.app",
    ],
    credentials: true,
  })
);

/* ======================
   BODY PARSERS
====================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ======================
   SECURITY
====================== */
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

/* ======================
   PATH SETUP
====================== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ======================
   STATIC FILES
====================== */
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

/* ======================
   RATE LIMITING
====================== */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
});

app.use("/api", apiLimiter);
app.use("/api/user/login", authLimiter);
app.use("/api/user/register", authLimiter);

/* ======================
   ROUTES
====================== */
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/review", reviewRoutes);

/* ======================
   HEALTH CHECK
====================== */
app.get("/", (req, res) => {
  res.send("API Working ✅");
});

/* ======================
   START SERVER
====================== */
connectDB();
connectCloudinary();

app.listen(port, () => {
  console.log(`🚀 Server running on PORT: ${port}`);
});
