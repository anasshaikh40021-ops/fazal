import express from "express"
import cors from "cors"
import rateLimit from "express-rate-limit"
import helmet from "helmet"
import "dotenv/config"

import connectDB from "./config/mongodb.js"
import connectCloudinary from "./config/cloudinary.js"

import userRouter from "./routes/userRoute.js"
import productRouter from "./routes/productRoute.js"
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
import reviewRoutes from "./routes/reviewRoutes.js"

// ======================
// APP CONFIG
// ======================
const app = express()
const port = process.env.PORT || 4000

connectDB()
connectCloudinary()

// ======================
// 🔒 SECURITY MIDDLEWARE
// ======================
app.use(helmet())

// Global API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, try again later",
  },
})

// Strict limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // only 5 attempts
  message: {
    success: false,
    message: "Too many login attempts, please try later",
  },
})

// ======================
// GENERAL MIDDLEWARE
// ======================
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(
  cors({
    origin: [
      "https://fazal-frontend-topaz.vercel.app",
      "http://localhost:5173",
    ],
    credentials: true,
  })
)

// ======================
// RATE LIMIT ROUTES
// ======================
app.use("/api", apiLimiter)
app.use("/api/user/login", authLimiter)
app.use("/api/user/register", authLimiter)

// ======================
// API ROUTES
// ======================
app.use("/api/user", userRouter)
app.use("/api/product", productRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)
app.use("/api/review", reviewRoutes)

// ======================
// HEALTH CHECK
// ======================
app.get("/", (req, res) => {
  res.send("API Working ✅")
})

// ======================
// START SERVER
// ======================
app.listen(port, () => {
  console.log("Server running on PORT:", port)
})
