import express from "express";
import { uploadMemory } from "../middleware/multer.js";
import authUser from "../middleware/auth.js";

import {
  loginUser,
  registerUser,
  getUserAddresses,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  addAddress,
  deleteAddress,
  changePassword,
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

userRouter.get("/profile", authUser, getUserProfile);

userRouter.put(
  "/update-profile",
  authUser,
  uploadMemory.single("image"),
  updateUserProfile
);

/* =====================
   ADDRESS ROUTES
===================== */
userRouter.post("/add-address", authUser, addAddress);
userRouter.delete("/delete-address", authUser, deleteAddress);
userRouter.get("/addresses", authUser, getUserAddresses);


/* =====================
   SECURITY ROUTE
===================== */
userRouter.put("/change-password", authUser, changePassword);

export default userRouter;
