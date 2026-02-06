import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import sendEmail from "../config/sendEmail.js";

/* =======================
   RAZORPAY INSTANCE
======================= */
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* =======================
   PLACE ORDER - COD
======================= */
const placeOrder = async (req, res) => {
  try {
    const { items, amount, address } = req.body;

    if (!items || items.length === 0) {
      return res.json({ success: false, message: "Cart is empty" });
    }

    const newOrder = new orderModel({
      userId: req.user.id,
      items,
      address,
      amount,
      paymentMethod: "Cash on Delivery",
      payment: false,
      status: "Order Placed",
      date: Date.now(),
    });

    await newOrder.save();
    await userModel.findByIdAndUpdate(req.user.id, { cartData: {} });

    /* ===== SEND EMAIL (COD) ===== */
    const user = await userModel.findById(req.user.id);

    if (user?.email) {
      await sendEmail({
        email: user.email,
        subject: "Order Placed Successfully - Fazal Store",
        title: "Thank you for your order 🎉",
        message: "Your order has been placed successfully.",
        order: newOrder,
        paymentMethod: "Cash on Delivery",
        paymentStatus: "Payment Pending",
      });
    }

    res.json({ success: true, message: "Order placed successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

/* =======================
   PLACE ORDER - RAZORPAY
======================= */
const placeOrderRazorpay = async (req, res) => {
  try {
    const { items, amount, address } = req.body;

    if (!items || items.length === 0) {
      return res.json({ success: false, message: "Cart is empty" });
    }

    const razorpayOrder = await razorpayInstance.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    const newOrder = new orderModel({
      userId: req.user.id,
      items,
      address,
      amount,
      paymentMethod: "Razorpay",
      payment: false,
      razorpayOrderId: razorpayOrder.id,
      status: "Payment Pending",
      date: Date.now(),
    });

    await newOrder.save();

    res.json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: "INR",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

/* =======================
   VERIFY RAZORPAY PAYMENT
======================= */
const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.json({
        success: false,
        message: "Payment verification failed",
      });
    }

    const order = await orderModel.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        payment: true,
        status: "Order Placed",
        razorpayPaymentId: razorpay_payment_id,
      },
      { new: true }
    );

    await userModel.findByIdAndUpdate(req.user.id, { cartData: {} });

    /* ===== SEND EMAIL (RAZORPAY SUCCESS) ===== */
    const user = await userModel.findById(req.user.id);

    if (user?.email) {
      await sendEmail({
        email: user.email,
        subject: "Payment Successful - Fazal Store",
        title: "Payment Successful ✅",
        message: "Your payment has been received and order is confirmed.",
        order,
        paymentMethod: "Razorpay",
        paymentStatus: "Paid",
      });
    }

    res.json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

/* =======================
   ADMIN - ALL ORDERS
======================= */
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find().sort({ date: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

/* =======================
   USER - OWN ORDERS
======================= */
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ userId: req.user.id })
      .sort({ date: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

/* =======================
   ADMIN - UPDATE STATUS
======================= */
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: "Order status updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

/* =======================
   EXPORTS
======================= */
export {
  placeOrder,
  placeOrderRazorpay,
  verifyRazorpayPayment,
  allOrders,
  userOrders,
  updateStatus,
};
