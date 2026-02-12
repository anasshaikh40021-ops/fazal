import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);

  /* ================= FETCH ALL ORDERS ================= */
  const fetchAllOrders = async () => {
    if (!token) return;

    try {
      const response = await axios.post(
        backendUrl + "/api/order/list",
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  /* ================= UPDATE ORDER STATUS ================= */
  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/order/status",
        { orderId, status: event.target.value },
        { headers: { token } }
      );

      if (response.data.success) {
        await fetchAllOrders();
        toast.success("Order status updated");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  return (
    <div className="px-4">
      <h3 className="text-xl font-semibold mb-4">Order Page</h3>

      <div>
        {orders.map((order, index) => (
          <div
            key={index}
            className={`grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] 
              lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] 
              gap-3 items-start border-2 
              p-5 md:p-8 my-3 md:my-4 
              text-xs sm:text-sm text-gray-700 rounded-lg
              ${
                order.status === "Cancelled"
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200"
              }`}
          >
            {/* Parcel Icon */}
            <img className="w-12" src={assets.parcel_icon} alt="" />

            {/* Order Details */}
            <div>
              <div>
                {order.items.map((item, i) => (
                  <p className="py-0.5" key={i}>
                    {item.name} x {item.quantity}{" "}
                    <span>{item.size}</span>
                    {i !== order.items.length - 1 && ","}
                  </p>
                ))}
              </div>

              {order.address && (
                <>
                  <p className="mt-3 mb-2 font-medium">
                    {order.address.name}
                  </p>

                  <div>
                    <p>{order.address.address},</p>
                    <p>
                      {order.address.city}, {order.address.state} -{" "}
                      {order.address.pincode}
                    </p>
                  </div>

                  <p>{order.address.phone}</p>
                </>
              )}

              {/* ================= CANCEL INFO ================= */}
              {order.status === "Cancelled" && (
                <div className="mt-4 p-3 bg-white border border-red-300 rounded text-red-700">
                  <p className="font-semibold">
                    ❌ Order Cancelled
                  </p>

                  {order.cancelReason && (
                    <p className="mt-1">
                      <span className="font-medium">
                        Reason:
                      </span>{" "}
                      {order.cancelReason}
                    </p>
                  )}

                  {order.cancelledAt && (
                    <p className="mt-1 text-xs">
                      Cancelled On:{" "}
                      {new Date(
                        order.cancelledAt
                      ).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Order Meta Info */}
            <div>
              <p className="text-sm sm:text-[15px]">
                Items : {order.items.length}
              </p>
              <p className="mt-3">
                Method : {order.paymentMethod}
              </p>
              <p>
                Payment : {order.payment ? "Done" : "Pending"}
              </p>
              <p>
                Date : {new Date(order.date).toLocaleDateString()}
              </p>
            </div>

            {/* Amount */}
            <p className="text-sm sm:text-[15px] font-semibold">
              {currency}
              {order.amount}
            </p>

            {/* Status Dropdown */}
            <select
              onChange={(event) =>
                statusHandler(event, order._id)
              }
              value={order.status}
              disabled={order.status === "Cancelled"}
              className={`p-2 font-semibold border rounded 
                ${
                  order.status === "Cancelled"
                    ? "bg-red-200 text-red-700 border-red-400 cursor-not-allowed"
                    : ""
                }`}
            >
              <option value="Order Placed">Order Placed</option>
              <option value="Packing">Packing</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for delivery">
                Out for delivery
              </option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
