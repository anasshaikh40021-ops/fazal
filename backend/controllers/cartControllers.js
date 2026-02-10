import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";

/* -------- ADD TO CART -------- */
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { itemId, size } = req.body;

    const user = await userModel.findById(userId);
    if (!user) return res.json({ success: false });

    const product = await productModel.findById(itemId);
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    // ✅ SIZE-WISE STOCK CHECK
    const sizeObj = product.sizes.find((s) => s.size === size);

    if (!sizeObj) {
      return res.json({
        success: false,
        message: "Selected size not available",
      });
    }

    const availableStock = sizeObj.stock;

    let cartData = user.cartData || {};

    if (!cartData[itemId]) {
      cartData[itemId] = {};
    }

    const currentQty = cartData[itemId][size] || 0;
    const newQty = currentQty + 1;

    if (newQty > availableStock) {
      return res.json({
        success: false,
        message: "Not enough stock for selected size",
      });
    }

    cartData[itemId][size] = newQty;

    user.cartData = cartData;
    user.markModified("cartData");

    await user.save();

    res.json({ success: true, cartData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

/* -------- UPDATE CART -------- */
const updateCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId, size, quantity } = req.body;

    const user = await userModel.findById(userId);
    if (!user) return res.json({ success: false });

    const product = await productModel.findById(itemId);
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    // ✅ SIZE-WISE STOCK CHECK
    const sizeObj = product.sizes.find((s) => s.size === size);

    if (!sizeObj) {
      return res.json({
        success: false,
        message: "Selected size not available",
      });
    }

    const availableStock = sizeObj.stock;

    if (quantity > availableStock) {
      return res.json({
        success: false,
        message: "Requested quantity exceeds stock for this size",
      });
    }

    let cartData = user.cartData || {};

    if (!cartData[itemId]) {
      cartData[itemId] = {};
    }

    if (quantity === 0) {
      delete cartData[itemId][size];
      if (Object.keys(cartData[itemId]).length === 0) {
        delete cartData[itemId];
      }
    } else {
      cartData[itemId][size] = quantity;
    }

    user.cartData = cartData;
    user.markModified("cartData");

    await user.save();

    res.json({ success: true, cartData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

/* -------- GET USER CART -------- */
const getUserCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await userModel.findById(userId);

    if (!user) return res.json({ success: true, cartData: {} });

    res.json({ success: true, cartData: user.cartData || {} });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { addToCart, updateCart, getUserCart };
