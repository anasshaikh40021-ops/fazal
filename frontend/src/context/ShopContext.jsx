import React, { useEffect, useState, createContext } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const currency = "$";
  const delivery_fee = 10;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const navigate = useNavigate();

  /* ---------------- STATE ---------------- */
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState("");
  const [role, setRole] = useState("");

  // 👤 USER PROFILE
  const [user, setUser] = useState(null);

  // 🔍 SEARCH
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");

  /* ---------------- AUTH ---------------- */

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken("");
    setRole("");
    setUser(null);
    setCartItems({});
    navigate("/login");
  };

  /* ---------------- USER PROFILE ---------------- */

  const fetchUserProfile = async () => {
    if (!token) return;

    try {
      const res = await axios.get(`${backendUrl}/api/user/profile`, {
        headers: { token },
      });

      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (error) {
      console.log(error);
    }
  };

  /* ---------------- CART ---------------- */

  const addToCart = async (itemId, size) => {
    if (!size) return toast.error("Select Product Size");
    if (!token) return toast.error("Login first");

    try {
      const res = await axios.post(
        `${backendUrl}/api/cart/add`,
        { itemId, size },
        { headers: { token } }
      );

      if (res.data.success) {
        setCartItems(res.data.cartData);
        toast.success("Product added to cart 🛒");
      } else {
        toast.error(res.data.message || "Unable to add to cart");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const updateQuantity = async (itemId, size, quantity) => {
    if (!token) return;

    try {
      const res = await axios.post(
        `${backendUrl}/api/cart/update`,
        { itemId, size, quantity },
        { headers: { token } }
      );

      if (res.data.success) {
        setCartItems(res.data.cartData);
      } else {
        toast.error(res.data.message || "Stock limit reached");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getUserCart = async () => {
    if (!token) return;

    try {
      const res = await axios.post(
        `${backendUrl}/api/cart/get`,
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
      const product = products.find((p) => p._id === id);
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
      const res = await axios.get(`${backendUrl}/api/product/list`);
      if (res.data.success) setProducts(res.data.products);
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
    const savedRole = localStorage.getItem("role");

    if (savedToken) setToken(savedToken);
    if (savedRole) setRole(savedRole);
  }, []);

  useEffect(() => {
    if (token) {
      fetchUserProfile();
      getUserCart();
    }
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

        // 🔍 SEARCH
        showSearch,
        setShowSearch,
        search,
        setSearch,

        // 👤 USER
        user,
        setUser,
        fetchUserProfile,
        logout,

        navigate,
        token,
        setToken,
        role,
        backendUrl,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
