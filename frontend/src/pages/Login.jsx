import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const { setToken, setRole, navigate, backendUrl } = useContext(ShopContext);

  const [mode, setMode] = useState("login"); // login | register
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      /* ================= REGISTER ================= */
      if (mode === "register") {
        const res = await axios.post(
          backendUrl + "/api/user/register",
          { name, email, password }
        );

        if (!res.data.success) {
          return toast.error(res.data.message);
        }

        setToken(res.data.token);
        setRole(res.data.role);

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);

        toast.success("Account created successfully");
        navigate("/");
      }

      /* ================= LOGIN ================= */
      else {
        const res = await axios.post(
          backendUrl + "/api/user/login",
          { email, password }
        );

        if (!res.data.success) {
          return toast.error(res.data.message);
        }

        setToken(res.data.token);
        setRole(res.data.role);

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);

        toast.success("Logged in successfully");

        // 🔑 ROLE BASED REDIRECT
        if (res.data.role === "admin") {
          window.location.href = import.meta.env.VITE_ADMIN_URL;
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <form
      onSubmit={submitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-16 gap-4 text-gray-800"
    >
      <h2 className="text-3xl font-semibold">
        {mode === "login" ? "Login" : "Create Account"}
      </h2>

      {mode === "register" && (
        <input
          type="text"
          placeholder="Name"
          className="w-full px-3 py-2 border border-gray-800"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      )}

      <input
        type="email"
        placeholder="Email"
        className="w-full px-3 py-2 border border-gray-800"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full px-3 py-2 border border-gray-800"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <div className="w-full flex justify-between text-sm">
        <p
          className="cursor-pointer underline"
          onClick={() => navigate("/forgot-password")}
        >
          Forgot password?
        </p>

        {mode === "login" ? (
          <p
            className="cursor-pointer underline"
            onClick={() => setMode("register")}
          >
            Create account
          </p>
        ) : (
          <p
            className="cursor-pointer underline"
            onClick={() => setMode("login")}
          >
            Login instead
          </p>
        )}
      </div>

      <button className="bg-black text-white px-8 py-2 mt-4">
        {mode === "login" ? "Login" : "Register"}
      </button>
    </form>
  );
};

export default Login;
