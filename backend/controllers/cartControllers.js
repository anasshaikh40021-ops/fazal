import userModel from "../models/userModel.js";

/* -------- ADD TO CART -------- */
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId, size } = req.body;

    const user = await userModel.findById(userId);
    if (!user) return res.json({ success: false });

    let cartData = user.cartData || {};

    if (!cartData[itemId]) {
      cartData[itemId] = {};
    }

    cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;

    user.cartData = cartData;

    // ✅ THIS IS THE FIX
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

    let cartData = user.cartData || {};

    if (quantity === 0) {
      delete cartData[itemId][size];
      if (Object.keys(cartData[itemId]).length === 0) {
        delete cartData[itemId];
      }
    } else {
      cartData[itemId][size] = quantity;
    }

    user.cartData = cartData;

    // ✅ SAME FIX HERE
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
