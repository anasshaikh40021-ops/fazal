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
   GET PROFILE
===================== */
userRouter.get("/profile", authUser, async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

/* =====================
   UPDATE PROFILE (NAME / IMAGE / REMOVE IMAGE)
===================== */
userRouter.put(
  "/update-profile",
  authUser,
  upload.single("image"),
  async (req, res) => {
    try {
      const updateData = {};

      // update name
      if (req.body.name) {
        updateData.name = req.body.name;
      }

      // 🔥 REMOVE PROFILE IMAGE
      if (req.body.removeImage === "true") {
        updateData.profileImage = "";
      }

      // upload new image
      if (req.file) {
        updateData.profileImage = req.file.path;
      }

      const user = await userModel.findByIdAndUpdate(
        req.user.id,
        updateData,
        { new: true }
      ).select("-password");

      res.json({ success: true, user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false });
    }
  }
);

export default userRouter;
