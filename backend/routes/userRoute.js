import express from "express";
import upload from "../middleware/multer.js";
import authUser from "../middleware/auth.js";
import userModel from "../models/userModel.js";

import {
  loginUser,
  registerUser,
  forgotPassword,
  resetPassword,
} from "../controllers/userController.js";

const userRouter = express.Router();

/* =====================
   AUTH ROUTES
===================== */
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password/:token", resetPassword);

/* =====================
   PROFILE ROUTES
===================== */

// Get profile
userRouter.get("/profile", authUser, async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// Update profile (name + image)
userRouter.put(
  "/update-profile",
  authUser,
  upload.single("image"),
  async (req, res) => {
    try {
      const updateData = {};

      if (req.body.name) updateData.name = req.body.name;
      if (req.file) updateData.profileImage = req.file.path;

      await userModel.findByIdAndUpdate(req.user.id, updateData);

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false });
    }
  }
);

/* =====================
   REMOVE PROFILE PHOTO ✅
===================== */
userRouter.delete("/remove-profile-photo", authUser, async (req, res) => {
  try {
    await userModel.findByIdAndUpdate(req.user.id, {
      $unset: { profileImage: "" },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

export default userRouter;
