import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

/* ======================================================
   ADD PRODUCT
====================================================== */
const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      type,              // ✅ ADDED
      sizes,
      showOnBanner,
      bestseller,
    } = req.body;

    // ---------- VALIDATION ----------
    if (!name || !description || !price || !category || !subCategory || !type) {
      return res.json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    // ---------- IMAGES ----------
    const image1 = req.files?.image1?.[0];
    const image2 = req.files?.image2?.[0];
    const image3 = req.files?.image3?.[0];
    const image4 = req.files?.image4?.[0];

    const images = [image1, image2, image3, image4].filter(Boolean);

    if (images.length === 0) {
      return res.json({
        success: false,
        message: "At least one image is required",
      });
    }

    const imagesUrl = await Promise.all(
      images.map(async (item) => {
        const result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return result.secure_url;
      })
    );

    // ---------- SIZES ----------
    let parsedSizes = [];

    if (sizes) {
      parsedSizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes;
    }

    parsedSizes = parsedSizes.map((s) => ({
      size: s.size,
      stock: Number(s.stock) || 0,
    }));

    // ---------- PRODUCT DATA ----------
    const productData = {
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      subCategory: subCategory.trim(),
      type: type.trim(),             // ✅ SAVING TYPE
      price: Number(price),
      bestseller: bestseller === "true" || bestseller === true,
      showOnBanner: showOnBanner === "true" || showOnBanner === true,
      sizes: parsedSizes,
      image: imagesUrl,
      date: Date.now(),
    };

    const product = new productModel(productData);
    await product.save();

    return res.json({
      success: true,
      message: "Product added successfully",
      product,
    });

  } catch (error) {
    console.error("ADD PRODUCT ERROR:", error);
    return res.json({ success: false, message: error.message });
  }
};

/* ======================================================
   LIST ALL PRODUCTS
====================================================== */
const listProduct = async (req, res) => {
  try {
    const products = await productModel.find({});
    return res.json({ success: true, products });
  } catch (error) {
    console.error("LIST PRODUCT ERROR:", error);
    return res.json({ success: false, message: error.message });
  }
};

/* ======================================================
   GET SINGLE PRODUCT
====================================================== */
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;

    const product = await productModel.findById(productId);

    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    return res.json({ success: true, product });

  } catch (error) {
    console.error("SINGLE PRODUCT ERROR:", error);
    return res.json({ success: false, message: error.message });
  }
};

/* ======================================================
   REMOVE PRODUCT
====================================================== */
const removeProduct = async (req, res) => {
  try {
    const { id } = req.body;

    const deleted = await productModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.json({ success: false, message: "Product not found" });
    }

    return res.json({
      success: true,
      message: "Product removed successfully",
    });

  } catch (error) {
    console.error("REMOVE PRODUCT ERROR:", error);
    return res.json({ success: false, message: error.message });
  }
};

/* ======================================================
   UPDATE STOCK
====================================================== */
const updateProductStock = async (req, res) => {
  try {
    const { productId, size, stock } = req.body;

    const product = await productModel.findById(productId);

    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    const sizeObj = product.sizes.find((s) => s.size === size);

    if (!sizeObj) {
      return res.json({ success: false, message: "Size not found" });
    }

    sizeObj.stock = Number(stock);
    await product.save();

    return res.json({
      success: true,
      message: "Stock updated successfully",
      product,
    });

  } catch (error) {
    console.error("UPDATE STOCK ERROR:", error);
    return res.json({ success: false, message: error.message });
  }
};

export {
  addProduct,
  listProduct,
  singleProduct,
  removeProduct,
  updateProductStock,
};
