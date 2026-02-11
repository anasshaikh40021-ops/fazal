import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import axios from "axios";

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD USER ORDERS ================= */
  const loadOrders = async () => {
    try {
      if (!token) return;

      setLoading(true);

      const response = await axios.post(
        backendUrl + "/api/order/userorders",
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        // Backend already sorts by latest first
        setOrders(response.data.orders);
      }

      setLoading(false);
    } catch (error) {
      console.log("Orders API error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadOrders();
  }, [token]);

  if (loading)
    return <p className="p-6 text-gray-500">Loading orders...</p>;

  if (!orders.length)
    return <p className="p-6 text-gray-500">No orders found.</p>;

  return (
    <div className="border-t pt-12 px-4 min-h-[80vh]">
      <div className="text-2xl mb-8">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      <div className="space-y-8">
        {orders.map((order) => {
          /* ================= PAYMENT TEXT ================= */
          let paymentText = "";
          let statusColor = "bg-yellow-500";

          if (order.paymentMethod === "Razorpay") {
            paymentText = order.payment
              ? "Razorpay Payment Successful"
              : "Razorpay Payment Pending";
          } else {
            paymentText = "Cash on Delivery";
          }

          /* ================= STATUS COLOR ================= */
          if (order.status === "Delivered") {
            statusColor = "bg-green-500";
          } else if (order.status === "Cancelled") {
            statusColor = "bg-red-500";
          } else if (order.status === "Order Placed") {
            statusColor = "bg-blue-500";
          }

          return (
            <div
              key={order._id}
              className="border rounded-xl p-5 shadow-sm bg-white"
            >
              {/* ================= ORDER HEADER ================= */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
                <div>
                  <p className="text-sm text-gray-500">
                    Order Date:{" "}
                    {new Date(order.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Payment: {paymentText}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${statusColor}`}
                  ></span>
                  <p className="text-sm font-medium">
                    {order.status}
                  </p>
                </div>
              </div>

              {/* ================= ORDER ITEMS ================= */}
              <div className="space-y-5">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 items-start border-t pt-4"
                  >
                    {/* PRODUCT IMAGE */}
                    <img
                      className="w-20 h-20 object-cover rounded-lg border"
                      src={
                        item.image && item.image.startsWith("http")
                          ? item.image
                          : item.image
                      }
                      alt={item.name}
                    />

                    {/* PRODUCT DETAILS */}
                    <div className="flex-1">
                      <p className="font-medium text-base">
                        {item.name}
                      </p>

                      <div className="text-sm text-gray-600 mt-2 flex flex-wrap gap-4">
                        <p>
                          {currency}
                          {item.price}
                        </p>
                        <p>Qty: {item.quantity}</p>
                        <p>Size: {item.size}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ================= TOTAL ================= */}
              <div className="border-t mt-5 pt-4 flex justify-between items-center">
                <p className="font-medium">Total Amount</p>
                <p className="font-semibold text-lg">
                  {currency}
                  {order.amount}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
