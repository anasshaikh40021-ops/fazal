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

    // 👤 PROFILE IMAGE (URL)
    profileImage: {
      type: String,
      default: "",
    },

    // 👤 PROFILE IMAGE CLOUDINARY PUBLIC ID ✅ REQUIRED
    profileImagePublicId: {
      type: String,
      default: "",
    },

    // 🏠 ADDRESSES
    addresses: [
      {
        name: String,
        phone: String,
        address: String,
        city: String,
        state: String,
        pincode: String,
      },
    ],

    // 🔑 FORGOT PASSWORD
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
