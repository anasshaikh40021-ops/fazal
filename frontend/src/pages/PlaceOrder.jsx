import React, { useContext, useEffect, useState } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod");
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);

  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
    products,
  } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    pincode: "",
    flat: "",
    area: "",
    city: "",
    state: "",
  });

  /* ================= LOAD SAVED ADDRESSES ================= */
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await axios.get(
          backendUrl + "/api/user/profile",
          { headers: { token } }
        );

        if (res.data.success && res.data.user.addresses) {
          setSavedAddresses(res.data.user.addresses);
        }
      } catch (err) {
        console.log("Failed to load addresses");
      }
    };

    if (token) fetchAddresses();
  }, [token, backendUrl]);

  /* ================= PROTECT EMPTY CART ================= */
  useEffect(() => {
    let hasItems = false;

    for (const p in cartItems) {
      for (const s in cartItems[p]) {
        if (cartItems[p][s] > 0) hasItems = true;
      }
    }

    if (!hasItems) navigate("/cart");
  }, [cartItems, navigate]);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= SELECT SAVED ADDRESS ================= */
  const handleSelectAddress = (index) => {
    const addr = savedAddresses[index];

    setSelectedAddressIndex(index);

    const splitAddress = addr.address.split(",");

    setFormData({
      fullName: addr.name,
      phone: addr.phone,
      pincode: addr.pincode,
      flat: splitAddress[0] || "",
      area: splitAddress[1] || "",
      city: addr.city,
      state: addr.state,
    });
  };

  /* ================= BUILD ORDER ITEMS ================= */
  const buildOrderItems = () => {
    let orderItems = [];

    for (const productId in cartItems) {
      for (const size in cartItems[productId]) {
        const quantity = cartItems[productId][size];

        if (quantity > 0) {
          const product = products.find((p) => p._id === productId);

          if (product) {
            orderItems.push({
              itemId: product._id,
              size: size,
              quantity: quantity,
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
        return;
      }

      const addressObject = {
        name: formData.fullName,
        phone: formData.phone,
        address: `${formData.flat}, ${formData.area}`,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
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
          toast.error(data.message || "Payment initiation failed");
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
            try {
              const verifyRes = await axios.post(
                backendUrl + "/api/order/verify-razorpay",
                response,
                { headers: { token } }
              );

              if (verifyRes.data.success) {
                toast.success("Payment successful");
                setCartItems({});
                navigate("/orders");
              } else {
                toast.error("Payment verification failed");
              }
            } catch (err) {
              toast.error("Verification failed");
            }
          },
          prefill: {
            name: formData.fullName,
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

        {/* SAVED ADDRESSES */}
        {savedAddresses.length > 0 && (
          <div className="border p-4 rounded mb-4">
            <p className="font-medium mb-3">Saved Addresses</p>

            {savedAddresses.map((addr, index) => (
              <div
                key={index}
                onClick={() => handleSelectAddress(index)}
                className={`border p-3 mb-2 cursor-pointer ${
                  selectedAddressIndex === index
                    ? "border-black bg-gray-100"
                    : ""
                }`}
              >
                <p className="text-sm font-medium">{addr.name}</p>
                <p className="text-xs text-gray-600">
                  {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                </p>
                <p className="text-xs text-gray-600">{addr.phone}</p>
              </div>
            ))}
          </div>
        )}

        <input required name="fullName" value={formData.fullName} onChange={onChangeHandler} className="border px-3 py-2 w-full" placeholder="Full Name" />
        <input required name="phone" value={formData.phone} onChange={onChangeHandler} className="border px-3 py-2 w-full" placeholder="Mobile Number" />
        <input required name="pincode" value={formData.pincode} onChange={onChangeHandler} className="border px-3 py-2 w-full" placeholder="Pincode" />
        <input required name="flat" value={formData.flat} onChange={onChangeHandler} className="border px-3 py-2 w-full" placeholder="Flat / House No." />
        <input required name="area" value={formData.area} onChange={onChangeHandler} className="border px-3 py-2 w-full" placeholder="Area / Street" />

        <div className="flex gap-3">
          <input required name="city" value={formData.city} onChange={onChangeHandler} className="border px-3 py-2 w-full" placeholder="City" />
          <input required name="state" value={formData.state} onChange={onChangeHandler} className="border px-3 py-2 w-full" placeholder="State" />
        </div>
      </div>

      {/* ================= PAYMENT SECTION ================= */}
      <div className="flex-1">
        <CartTotal />

        <div className="mt-10">
          <Title text1={"PAYMENT"} text2={"METHOD"} />

          <div className="flex flex-col gap-3 mt-4">
            <div onClick={() => setMethod("razorpay")} className="border p-3 cursor-pointer flex gap-3 items-center">
              <span className={`w-4 h-4 border rounded-full ${method === "razorpay" ? "bg-green-500" : ""}`} />
              <p className="text-sm">UPI / PhonePe / GPay</p>
            </div>

            <div onClick={() => setMethod("cod")} className="border p-3 cursor-pointer flex gap-3 items-center">
              <span className={`w-4 h-4 border rounded-full ${method === "cod" ? "bg-green-500" : ""}`} />
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
