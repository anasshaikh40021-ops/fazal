import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import axios from "axios";
import { toast } from "react-toastify";

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ NEW STATES (Cancel Modal)
  const [showModal, setShowModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

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
        setOrders(response.data.orders);
      }

      setLoading(false);
    } catch (error) {
      console.log("Orders API error:", error);
      setLoading(false);
    }
  };

  /* ================= OPEN CANCEL MODAL ================= */
  const openCancelModal = (orderId) => {
    setSelectedOrderId(orderId);
    setCancelReason("");
    setShowModal(true);
  };

  /* ================= CONFIRM CANCEL ================= */
  const confirmCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }

    try {
      const response = await axios.post(
        backendUrl + "/api/order/cancel",
        { orderId: selectedOrderId, reason: cancelReason },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Order cancelled successfully");
        setShowModal(false);
        loadOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Cancel failed");
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
    <>
      <div className="border-t pt-12 px-4 min-h-[80vh]">
        <div className="text-2xl mb-8">
          <Title text1={"MY"} text2={"ORDERS"} />
        </div>

        <div className="space-y-8">
          {orders.map((order) => {
            let paymentText = "";
            let statusColor = "bg-yellow-500";

            if (order.paymentMethod === "Razorpay") {
              paymentText = order.payment
                ? "Razorpay Payment Successful"
                : "Razorpay Payment Pending";
            } else {
              paymentText = "Cash on Delivery";
            }

            if (order.status === "Delivered") {
              statusColor = "bg-green-500";
            } else if (order.status === "Cancelled") {
              statusColor = "bg-red-500";
            } else if (order.status === "Order Placed") {
              statusColor = "bg-blue-500";
            }

            const canCancel =
              order.status !== "Delivered" &&
              order.status !== "Cancelled";

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

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3 h-3 rounded-full ${statusColor}`}
                      ></span>
                      <p className="text-sm font-medium">
                        {order.status}
                      </p>
                    </div>

                    {canCancel && (
                      <button
                        onClick={() =>
                          openCancelModal(order._id)
                        }
                        className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {/* ================= DELIVERY ADDRESS ================= */}
                {order.address && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4 text-sm">
                    <p className="font-medium">
                      {order.address.name}
                    </p>
                    <p className="text-gray-600">
                      {order.address.address}
                    </p>
                    <p className="text-gray-600">
                      {order.address.city},{" "}
                      {order.address.state} -{" "}
                      {order.address.pincode}
                    </p>
                    <p className="text-gray-600">
                      {order.address.phone}
                    </p>
                  </div>
                )}

                {/* ================= ORDER ITEMS ================= */}
                <div className="space-y-5">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-4 items-start border-t pt-4"
                    >
                      <img
                        className="w-20 h-20 object-cover rounded-lg border"
                        src={item.image}
                        alt={item.name}
                      />

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

      {/* ================= CANCEL MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
          <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              Cancel Order
            </h2>

            <textarea
              rows="4"
              placeholder="Please tell us why you are cancelling this order..."
              className="w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black"
              value={cancelReason}
              onChange={(e) =>
                setCancelReason(e.target.value)
              }
            ></textarea>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm border rounded-lg"
              >
                Close
              </button>

              <button
                onClick={confirmCancelOrder}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Orders;
