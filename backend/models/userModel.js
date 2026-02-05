import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    cartData: {
      type: Object,
      default: {},
    },

    // 🔑 REQUIRED FOR FORGOT PASSWORD
    resetPasswordToken: {
      type: String,
    },

    resetPasswordExpire: {
      type: Date,
    },
  },
  { minimize: false }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
