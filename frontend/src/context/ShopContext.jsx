import React, { useEffect, useState, createContext } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const currency = "$";
  const delivery_fee = 10;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState("");

  const navigate = useNavigate();

  /* ---------------- CART ---------------- */

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Select Product Size");
      return;
    }

    if (!token) {
      toast.error("Login first");
      return;
    }

    try {
      const res = await axios.post(
        backendUrl + "/api/cart/add",
        { itemId, size },
        { headers: { token } }
      );

      if (res.data.success) {
        setCartItems(res.data.cartData); // ✅ ONLY backend source
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateQuantity = async (itemId, size, quantity) => {
    if (!token) return;

    try {
      const res = await axios.post(
        backendUrl + "/api/cart/update",
        { itemId, size, quantity },
        { headers: { token } }
      );

      if (res.data.success) {
        setCartItems(res.data.cartData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getUserCart = async () => {
    if (!token) return;

    try {
      const res = await axios.post(
        backendUrl + "/api/cart/get",
        {},
        { headers: { token } }
      );

      if (res.data.success) {
        setCartItems(res.data.cartData || {});
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getCartCount = () => {
    let count = 0;
    for (const id in cartItems) {
      for (const size in cartItems[id]) {
        count += cartItems[id][size];
      }
    }
    return count;
  };

  const getCartAmount = () => {
    let total = 0;
    for (const id in cartItems) {
      const product = products.find(p => p._id === id);
      if (!product) continue;

      for (const size in cartItems[id]) {
        total += product.price * cartItems[id][size];
      }
    }
    return total;
  };

  /* ---------------- PRODUCTS ---------------- */

  const getProductsData = async () => {
    try {
      const res = await axios.get(backendUrl + "/api/product/list");
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (error) {
      console.log(error);
    }
  };

  /* ---------------- EFFECTS ---------------- */

  useEffect(() => {
    getProductsData();
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
  }, []);

  useEffect(() => {
    if (token) getUserCart(); // ✅ load cart ONCE
  }, [token]);

  return (
    <ShopContext.Provider
      value={{
        products,
        currency,
        delivery_fee,
        cartItems,
        setCartItems,
        addToCart,
        updateQuantity,
        getCartCount,
        getCartAmount,
        navigate,
        token,
        setToken,
        backendUrl
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;