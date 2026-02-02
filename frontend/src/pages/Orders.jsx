import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import axios from "axios";


const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [orderData, setorderData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadOrderData = async () => {
    try {
      if (!token) {
        return null
      }
      
      const response = await axios.post(backendUrl + '/api/order/userorders',{},{ headers: { token } })

      console.log(response.data); // 🔥 log response

      if (response.data.success) {
        let allOrdersItem = []
         response.data.orders.map((order)=>{
          order.items.map((item)=>{
            item['status'] =  order.status
            item['payment'] =  order.payment
            item['paymentMethod'] =  order.paymentMethod
            item['date'] = order.date
            allOrdersItem.push(item)
          })
         })
         
        setorderData(allOrdersItem.reverse());
      }

      setLoading(false);
    } catch (error) {
      console.log("Orders API error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    loadOrderData();
  }, [token])

  if (loading) return <p className="p-4">Loading orders...</p>;

  if (!orderData.length) return <p className="p-4">No orders found.</p>;

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      <div>
        {orderData.map((item, index) => (
          <div
            key={index}
            className="py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center gap-4"
          >
            {/* LEFT */}
            <div className="flex items-start gap-6 text-sm flex-1">
              <img
                className="w-16 sm:w-20"
                src={item.image?.[0] || "/placeholder.png"}
                alt={item.name}
              />

              <div>
                <p className="sm:text-base font-medium">{item.name}</p>

                <div className="flex items-center gap-3 mt-2 text-base text-gray-700">
                  <p>
                    {currency}
                    {item.price}
                  </p>
                  <p>Quantity: {item.quantity || 1}</p>
                  <p>Size: {item.size || "M"}</p>
                </div>

                <p className="mt-1">
                  Date:{" "}
                  <span className="text-gray-400">
                    {item.date ? new Date(item.date).toLocaleDateString() : "-"}
                  </span>
                </p>
                <p className="mt-1">
                  Payment:{" "}
                  <span className="text-gray-400">
                    {item.paymentMethod}
                  </span>
                </p>
              </div>
            </div>

            {/* RIGHT */}
            <div className="md:w-1/2 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span
                  className={`min-w-2 h-2 rounded-full ${
                    item.status === "Delivered"
                      ? "bg-green-500"
                      : "bg-yellow-500"
                  }`}
                ></span>
                <p className="text-sm md:text-base">{item.status}</p>
              </div>
              <button onClick={loadOrderData} className="border px-4 py-2 text-sm font-medium rounded-sm">
                Track Order
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
