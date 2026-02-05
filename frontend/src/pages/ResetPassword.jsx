import React, { useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";

const ResetPassword = () => {
  const { token } = useParams();
  const { backendUrl } = useContext(ShopContext);
  const navigate = useNavigate();

  const [password, setPassword] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        backendUrl + `/api/user/reset-password/${token}`,
        { password }
      );

      if (res.data.success) {
        toast.success("Password reset successful");
        navigate("/login");
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
      <h2 className="text-2xl font-semibold">Reset Password</h2>

      <input
        type="password"
        placeholder="New Password"
        className="w-full px-3 py-2 border border-gray-800"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button className="bg-black text-white px-8 py-2 mt-4">
        Update Password
      </button>
    </form>
  );
};

export default ResetPassword;
