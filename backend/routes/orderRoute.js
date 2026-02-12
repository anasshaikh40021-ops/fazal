import express from "express";
import {
  placeOrder,
  placeOrderRazorpay,
  verifyRazorpayPayment,
  allOrders,
  userOrders,
  updateStatus,
  cancelOrder,
} from "../controllers/orderControllers.js";

import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";

const orderRouter = express.Router();

/* =======================
   ADMIN ROUTES
======================= */
orderRouter.post("/list", adminAuth, allOrders);
orderRouter.post("/status", adminAuth, updateStatus);

/* =======================
   USER / PAYMENT ROUTES
======================= */
orderRouter.post("/place", authUser, placeOrder); // COD
orderRouter.post("/razorpay", authUser, placeOrderRazorpay);
orderRouter.post("/verify-razorpay", authUser, verifyRazorpayPayment);
orderRouter.post("/userorders", authUser, userOrders);

/* =======================
   USER - CANCEL ORDER
======================= */
orderRouter.post("/cancel", authUser, cancelOrder);

export default orderRouter;
