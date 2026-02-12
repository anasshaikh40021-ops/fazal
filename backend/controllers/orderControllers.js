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
======================= */
const prepareOrderItems = async (items) => {
  const preparedItems = [];

  for (const item of items) {
    const product = await productModel.findById(item.itemId);
    if (!product) throw new Error("Product not found");

    const selectedSize = product.sizes.find(
      (s) => s.size === item.size
    );

    if (!selectedSize)
      throw new Error(
        `Size ${item.size} not available for ${product.name}`
      );

    if (selectedSize.stock < item.quantity)
      throw new Error(
        `Insufficient stock for ${product.name} (Size: ${item.size})`
      );

    preparedItems.push({
      productId: product._id.toString(),
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      image: product.image?.[0] || "",
      size: item.size,
    });
  }

  return preparedItems;
};

/* =======================
   DEDUCT STOCK
======================= */
const deductStockForOrder = async (items) => {
  for (const item of items) {
    if (!item.size)
      throw new Error(`Size missing for product ${item.productId}`);

    const updated = await productModel.findOneAndUpdate(
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

    if (!updated)
      throw new Error(
        `Insufficient stock for product ${item.productId} (Size: ${item.size})`
      );
  }
};

/* =======================
   SAVE ADDRESS
======================= */
const saveAddressToUser = async (userId, address) => {
  const user = await userModel.findById(userId);
  if (!user) return;

  const exists = user.addresses?.some(
    (addr) =>
      addr.address === address.address &&
      addr.pincode === address.pincode
  );

  if (!exists) {
    user.addresses.push(address);
    await user.save();
  }
};

/* =======================
   SEND ORDER EMAIL
======================= */
const sendOrderConfirmationEmail = async (userId, order) => {
  const user = await userModel.findById(userId);
  if (!user || !user.email) return;

  await sendEmail({
    email: user.email,
    subject: "Order Confirmation - Fazal Store",
    title: "Your Order Has Been Confirmed 🎉",
    message: "Thank you for shopping with us!",
    order,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
  });
};

/* =======================
   SEND CANCELLATION EMAIL
======================= */
const sendOrderCancellationEmail = async (userId, order) => {
  const user = await userModel.findById(userId);
  if (!user || !user.email) return;

  await sendEmail({
    email: user.email,
    subject: "Order Cancelled - Fazal Store",
    title: "Your Order Has Been Cancelled ❌",
    message: "Your order has been successfully cancelled.",
    order,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
  });
};

/* =======================
   CANCEL ORDER (USER)
======================= */
const cancelOrder = async (req, res) => {
  try {
    const { orderId, reason } = req.body;

    if (!reason || reason.trim() === "") {
      return res.json({
        success: false,
        message: "Cancellation reason is required",
      });
    }

    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    // Check ownership
    if (order.userId.toString() !== req.user.id) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    // Prevent double cancel
    if (order.status === "Cancelled") {
      return res.json({
        success: false,
        message: "Order already cancelled",
      });
    }

    // Prevent cancelling delivered order
    if (order.status === "Delivered") {
      return res.json({
        success: false,
        message: "Delivered order cannot be cancelled",
      });
    }

    /* =====================
       RESTORE STOCK
    ====================== */
    for (const item of order.items) {
      await productModel.findOneAndUpdate(
        {
          _id: item.productId,
          "sizes.size": item.size,
        },
        {
          $inc: { "sizes.$.stock": item.quantity },
        }
      );
    }

    /* =====================
       UPDATE ORDER
    ====================== */
    order.status = "Cancelled";
    order.cancelReason = reason;
    order.cancelledAt = new Date();

    await order.save();

    /* =====================
       SEND EMAIL
    ====================== */
    await sendOrderCancellationEmail(order.userId, order);

    res.json({
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


/* =======================
   PLACE ORDER - COD
======================= */
const placeOrder = async (req, res) => {
  try {
    const { items, amount, address } = req.body;

    if (!items || items.length === 0)
      return res.json({ success: false, message: "Cart is empty" });

    const preparedItems = await prepareOrderItems(items);

    await deductStockForOrder(preparedItems);

    const newOrder = await orderModel.create({
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

    await userModel.findByIdAndUpdate(req.user.id, { cartData: {} });
    await saveAddressToUser(req.user.id, address);
    await sendOrderConfirmationEmail(req.user.id, newOrder);

    res.json({ success: true, message: "Order placed successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* =======================
   PLACE ORDER - RAZORPAY
======================= */
const placeOrderRazorpay = async (req, res) => {
  try {
    const { items, amount, address } = req.body;

    if (!items || items.length === 0)
      return res.json({ success: false, message: "Cart is empty" });

    const preparedItems = await prepareOrderItems(items);

    const razorpayOrder = await razorpayInstance.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    await orderModel.create({
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

    if (generatedSignature !== razorpay_signature)
      return res.json({
        success: false,
        message: "Payment verification failed",
      });

    const order = await orderModel.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!order)
      return res.json({ success: false, message: "Order not found" });

    if (order.paymentStatus === "success")
      return res.json({ success: true });

    await deductStockForOrder(order.items);

    order.payment = true;
    order.paymentStatus = "success";
    order.status = "Order Placed";
    order.razorpayPaymentId = razorpay_payment_id;

    await order.save();

    await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
    await saveAddressToUser(order.userId, order.address);

    await sendOrderConfirmationEmail(order.userId, order);

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
    const orders = await orderModel.find().sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
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
      .sort({ createdAt: -1 });

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
  cancelOrder,
};
