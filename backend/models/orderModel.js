import mongoose from "mongoose";

/* =========================
   ORDER ITEM SCHEMA
========================= */
const orderItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  quantity: {
    type: Number,
    required: true,
  },

  image: {
    type: String, // ✅ store product image here
    required: true,
  },
});

/* =========================
   ADDRESS SCHEMA
========================= */
const addressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
});

/* =========================
   ORDER SCHEMA
========================= */
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    items: [orderItemSchema], // ✅ structured items

    amount: {
      type: Number,
      required: true,
    },

    address: addressSchema, // ✅ structured address

    status: {
      type: String,
      required: true,
      default: "Order Placed",
    },

    paymentMethod: {
      type: String,
      required: true,
    },

    payment: {
      type: Boolean,
      required: true,
      default: false,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },

    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },

    date: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const orderModel =
  mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;
