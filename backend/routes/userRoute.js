import express from "express";
import upload from "../middleware/multer.js";
import authUser from "../middleware/auth.js";

import {
  loginUser,
  registerUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile,
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
userRouter.get("/profile", authUser, getUserProfile);

/* =====================
   UPDATE PROFILE (CLOUDINARY + VERCEL SAFE) ✅
===================== */
userRouter.put(
  "/update-profile",
  authUser,
  upload.single("image"),
  updateUserProfile
);

export default userRouter;
