import React, { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";

const ForgotPassword = () => {
  const { backendUrl } = useContext(ShopContext);
  const [email, setEmail] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(backendUrl + "/api/user/forgot-password", { email })


      if (res.data.success) {
        toast.success("Password reset link sent to your email");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <form
      onSubmit={submitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-20 gap-4 text-gray-800"
    >
      <h2 className="text-2xl font-semibold">Forgot Password</h2>

      <input
        type="email"
        placeholder="Enter your email"
        className="w-full px-3 py-2 border border-gray-800"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <button className="bg-black text-white px-8 py-2 mt-4">
        Send Reset Link
      </button>
    </form>
  );
};

export default ForgotPassword;
