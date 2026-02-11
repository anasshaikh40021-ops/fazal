import React, { useContext, useEffect, useState } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod");

  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
    products,
    user,
  } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    country: "India",
    fullName: "",
    phone: "",
    pincode: "",
    flat: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    makeDefault: false,
  });

  /* ================= PROTECT EMPTY CART ================= */
  useEffect(() => {
    let hasItems = false;

    for (const p in cartItems) {
      for (const s in cartItems[p]) {
        if (cartItems[p][s] > 0) hasItems = true;
      }
    }

    if (!hasItems) navigate("/cart");
  }, []);

  const onChangeHandler = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* ================= BUILD ORDER ITEMS ================= */
  const buildOrderItems = () => {
    let orderItems = [];

    for (const p in cartItems) {
      for (const s in cartItems[p]) {
        if (cartItems[p][s] > 0) {
          const product = products.find((pr) => pr._id === p);

          if (product) {
            orderItems.push({
              itemId: product._id,
              size: s,
              quantity: cartItems[p][s],
              name: product.name,
              price: product.price,
              image: product.image?.[0] || product.image,
            });
          }
        }
      }
    }

    return orderItems;
  };

  /* ================= SUBMIT ORDER ================= */
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const orderItems = buildOrderItems();

      if (orderItems.length === 0) {
        toast.error("Your cart is empty");
        navigate("/cart");
        return;
      }

      // 🔥 Map Amazon-style fields to backend format
      const addressObject = {
        name: formData.fullName,
        address: `${formData.flat}, ${formData.area}, ${formData.city}, ${formData.state}`,
        pincode: formData.pincode,
        phone: formData.phone,
        country: formData.country,
        landmark: formData.landmark,
      };

      const orderData = {
        address: addressObject,
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
      };

      /* ================= COD ================= */
      if (method === "cod") {
        const res = await axios.post(
          backendUrl + "/api/order/place",
          orderData,
          { headers: { token } }
        );

        if (res.data.success) {
          toast.success("Order placed successfully");
          setCartItems({});
          navigate("/orders");
        } else {
          toast.error(res.data.message);
        }
      }

      /* ================= RAZORPAY ================= */
      if (method === "razorpay") {
        const { data } = await axios.post(
          backendUrl + "/api/order/razorpay",
          orderData,
          { headers: { token } }
        );

        if (!data.success) {
          toast.error("Payment initiation failed");
          return;
        }

        const options = {
          key: data.key,
          amount: data.amount,
          currency: "INR",
          name: "Fazal Shop",
          description: "Order Payment",
          order_id: data.orderId,
          handler: async (response) => {
            const verifyRes = await axios.post(
              backendUrl + "/api/order/verify-razorpay",
              response,
              { headers: { token } }
            );

            if (verifyRes.data.success) {
              toast.success("Payment successful ✅");
              setCartItems({});
              navigate("/orders");
            } else {
              toast.error("Payment verification failed");
            }
          },
          prefill: {
            contact: formData.phone,
          },
          theme: { color: "#000000" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Order failed");
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col lg:flex-row gap-10 pt-10 border-t px-4"
    >
      {/* ================= DELIVERY INFO ================= */}
      <div className="flex flex-col gap-4 w-full lg:max-w-[500px]">
        <div className="text-xl mb-4">
          <Title text1={"DELIVERY"} text2={"ADDRESS"} />
        </div>

        <select
          name="country"
          value={formData.country}
          onChange={onChangeHandler}
          className="border px-3 py-2 w-full"
        >
          <option value="India">India</option>
        </select>

        <input
          required
          name="fullName"
          value={formData.fullName}
          onChange={onChangeHandler}
          className="border px-3 py-2 w-full"
          placeholder="Full Name (First and Last name)"
        />

        <input
          required
          name="phone"
          value={formData.phone}
          onChange={onChangeHandler}
          className="border px-3 py-2 w-full"
          placeholder="Mobile Number"
        />

        <input
          required
          name="pincode"
          value={formData.pincode}
          onChange={onChangeHandler}
          className="border px-3 py-2 w-full"
          placeholder="Pincode"
        />

        <input
          required
          name="flat"
          value={formData.flat}
          onChange={onChangeHandler}
          className="border px-3 py-2 w-full"
          placeholder="Flat, House no., Building, Company, Apartment"
        />

        <input
          required
          name="area"
          value={formData.area}
          onChange={onChangeHandler}
          className="border px-3 py-2 w-full"
          placeholder="Area, Street, Sector, Village"
        />

        <input
          name="landmark"
          value={formData.landmark}
          onChange={onChangeHandler}
          className="border px-3 py-2 w-full"
          placeholder="Landmark (Optional)"
        />

        <div className="flex gap-3">
          <input
            required
            name="city"
            value={formData.city}
            onChange={onChangeHandler}
            className="border px-3 py-2 w-full"
            placeholder="Town / City"
          />

          <input
            required
            name="state"
            value={formData.state}
            onChange={onChangeHandler}
            className="border px-3 py-2 w-full"
            placeholder="State"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="makeDefault"
            checked={formData.makeDefault}
            onChange={onChangeHandler}
          />
          Make this my default address
        </label>
      </div>

      {/* ================= PAYMENT SECTION ================= */}
      <div className="flex-1">
        <CartTotal />

        <div className="mt-10">
          <Title text1={"PAYMENT"} text2={"METHOD"} />

          <div className="flex flex-col gap-3 mt-4">
            <div
              onClick={() => setMethod("razorpay")}
              className="border p-3 cursor-pointer flex gap-3 items-center"
            >
              <span
                className={`w-4 h-4 border rounded-full ${
                  method === "razorpay" ? "bg-green-500" : ""
                }`}
              />
              <p className="text-sm">UPI / PhonePe / GPay</p>
            </div>

            <div
              onClick={() => setMethod("cod")}
              className="border p-3 cursor-pointer flex gap-3 items-center"
            >
              <span
                className={`w-4 h-4 border rounded-full ${
                  method === "cod" ? "bg-green-500" : ""
                }`}
              />
              <p className="text-sm">Cash on Delivery</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-right">
          <button className="bg-black text-white px-10 py-3 text-sm">
            PLACE ORDER
          </button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
