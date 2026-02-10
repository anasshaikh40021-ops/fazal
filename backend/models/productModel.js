import mongoose from "mongoose";

/* ======================================================
   SIZE + STOCK SCHEMA
====================================================== */
const sizeSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      required: true,
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { _id: false }
);

/* ======================================================
   PRODUCT SCHEMA
====================================================== */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    image: {
      type: [String],   // ✅ array of image URLs
      required: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    subCategory: {
      type: String,
      required: true,
      trim: true,
    },

    /* =====================
       SIZE-WISE LIVE STOCK
    ===================== */
    sizes: {
      type: [sizeSchema],   // ✅ [{ size, stock }]
      required: true,
      default: [],
    },

    bestseller: {
      type: Boolean,
      default: false,
    },

    date: {
      type: Number,
      required: true,
    },

    /* =====================
       REVIEWS META
    ===================== */
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    numReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

/* ======================================================
   MODEL EXPORT (SAFE FOR HOT RELOAD)
====================================================== */
const productModel =
  mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
