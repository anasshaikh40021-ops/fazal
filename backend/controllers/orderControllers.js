import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
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
   PREPARE ORDER ITEMS
   (ADD PRODUCT IMAGE + NAME SAFELY)
======================= */
const prepareOrderItems = async (items) => {
  const updatedItems = [];

  for (const item of items) {
    const product = await productModel.findById(item.itemId);

    if (!product) {
      throw new Error("Product not found");
    }

    updatedItems.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      image: product.image[0], // ✅ first product image
      size: item.size,
    });
  }

  return updatedItems;
};

/* =======================
   SAVE ADDRESS TO USER
======================= */
const saveAddressToUser = async (userId, address) => {
  const user = await userModel.findById(userId);

  if (!user) return;

  const alreadyExists = user.addresses.some(
    (addr) =>
      addr.address === address.address &&
      addr.pincode === address.pincode
  );

  if (!alreadyExists) {
    user.addresses.push(address);
    await user.save();
  }
};

/* =======================
   ATOMIC STOCK DEDUCTION
======================= */
const deductStockForOrder = async (items) => {
  for (const item of items) {
    const result = await productModel.findOneAndUpdate(
      {
        _id: item.productId,
        "sizes.size": item.size,
        "sizes.stock": { $gte: item.quantity },
      },
      {
        $inc: { "sizes.$.stock": -item.quantity },
      },
      { new: true }
    );

    if (!result) {
      throw new Error(
        `Insufficient stock for product ${item.productId} (Size: ${item.size})`
      );
    }
  }
};

/* =======================
   PLACE ORDER - COD
======================= */
const placeOrder = async (req, res) => {
  try {
    const { items, amount, address } = req.body;

    if (!items || items.length === 0) {
      return res.json({ success: false, message: "Cart is empty" });
    }

    // ✅ Attach images + clean structure
    const preparedItems = await prepareOrderItems(items);

    // ✅ Deduct stock
    await deductStockForOrder(preparedItems);

    const newOrder = new orderModel({
      userId: req.user.id,
      items: preparedItems,
      address,
      amount,
      paymentMethod: "Cash on Delivery",
      payment: false,
      paymentStatus: "pending",
      status: "Order Placed",
      date: Date.now(),
    });

    await newOrder.save();

    // ✅ Clear cart
    await userModel.findByIdAndUpdate(req.user.id, { cartData: {} });

    // ✅ Save address to user profile
    await saveAddressToUser(req.user.id, address);

    res.json({ success: true, message: "Order placed successfully" });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message || "Order failed",
    });
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

    const preparedItems = await prepareOrderItems(items);

    const razorpayOrder = await razorpayInstance.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    const newOrder = new orderModel({
      userId: req.user.id,
      items: preparedItems,
      address,
      amount,
      paymentMethod: "Razorpay",
      payment: false,
      paymentStatus: "pending",
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

    const order = await orderModel.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    // ✅ Deduct stock after success
    await deductStockForOrder(order.items);

    const updatedOrder = await orderModel.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        payment: true,
        paymentStatus: "success",
        status: "Order Placed",
        razorpayPaymentId: razorpay_payment_id,
      },
      { new: true }
    );

    await userModel.findByIdAndUpdate(req.user.id, { cartData: {} });

    // ✅ Save address to user profile
    await saveAddressToUser(req.user.id, updatedOrder.address);

    res.json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message || "Payment verification failed",
    });
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
    res.json({ success: false, message: error.message });
  }
};

/* =======================
   USER - OWN ORDERS
   (DELIVERED ORDERS WILL ALSO SHOW)
======================= */
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ userId: req.user.id })
      .sort({ date: -1 });

    res.json({ success: true, orders });
  } catch (error) {
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
    res.json({ success: false, message: error.message });
  }
};

export {
  placeOrder,
  placeOrderRazorpay,
  verifyRazorpayPayment,
  allOrders,
  userOrders,
  updateStatus,
};
