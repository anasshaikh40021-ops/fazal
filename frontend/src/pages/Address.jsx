import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import axios from "axios";

const Address = () => {
  const { backendUrl, token } = useContext(ShopContext);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD ADDRESSES ================= */
  const loadAddresses = async () => {
    try {
      if (!token) return;

      setLoading(true);

      const res = await axios.get(
        backendUrl + "/api/user/addresses",
        { headers: { token } }
      );

      if (res.data.success) {
        setAddresses(res.data.addresses);
      }

      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [token]);

  if (loading)
    return <p className="p-6 text-gray-500">Loading addresses...</p>;

  return (
    <div className="border-t pt-12 px-4 min-h-[80vh]">
      <div className="text-2xl mb-8">
        <Title text1={"MY"} text2={"ADDRESSES"} />
      </div>

      {addresses.length === 0 ? (
        <p className="text-gray-500">No saved addresses found.</p>
      ) : (
        <div className="space-y-6">
          {addresses.map((addr, index) => (
            <div
              key={index}
              className="border rounded-xl p-6 shadow-sm bg-white"
            >
              {/* HEADER */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-medium text-base">
                    {addr.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {addr.phone}
                  </p>
                </div>
              </div>

              {/* ADDRESS DETAILS */}
              <div className="text-sm text-gray-700 space-y-1 border-t pt-4">
                <p>{addr.flat}</p>
                <p>{addr.area}</p>

                {addr.landmark && (
                  <p>Landmark: {addr.landmark}</p>
                )}

                <p>
                  {addr.city}, {addr.state} - {addr.pincode}
                </p>

                {addr.country && (
                  <p>{addr.country}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Address;
