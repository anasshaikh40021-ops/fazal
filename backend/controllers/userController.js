import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import crypto from "crypto";
import nodemailer from "nodemailer";

/* =====================
   TOKEN
===================== */
const createToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

/* =====================
   LOGIN
===================== */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.json({ success: false, message: "User does not exist" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.json({ success: false, message: "Invalid credentials" });

    const token = createToken({ id: user._id, role: user.role });

    res.json({
      success: true,
      token,
      role: user.role,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* =====================
   REGISTER
===================== */
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (await User.findOne({ email }))
      return res.json({ success: false, message: "User already exists" });

    if (!validator.isEmail(email))
      return res.json({ success: false, message: "Invalid email" });

    if (password.length < 8)
      return res.json({
        success: false,
        message: "Password must be at least 8 characters",
      });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = createToken({ id: user._id, role: user.role });

    res.json({
      success: true,
      token,
      role: user.role,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* =====================
   GET PROFILE ✅ (IMPORTANT)
===================== */
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user)
      return res.json({ success: false, message: "User not found" });

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* =====================
   UPDATE PROFILE ✅
===================== */
const updateUserProfile = async (req, res) => {
  try {
    const updateData = {};

    if (req.body.name) updateData.name = req.body.name;
    if (req.file) updateData.profileImage = req.file.path;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* =====================
   FORGOT PASSWORD
===================== */
const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.json({ success: false, message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: user.email,
      subject: "Password Reset",
      html: `<a href="${resetUrl}">${resetUrl}</a>`,
    });

    res.json({ success: true, message: "Reset link sent" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* =====================
   RESET PASSWORD
===================== */
const resetPassword = async (req, res) => {
  try {
    const resetToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.json({ success: false, message: "Token expired" });

    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export {
  loginUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
};
