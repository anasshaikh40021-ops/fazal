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

  if (loading) return <p className="p-6">Loading addresses...</p>;

  return (
    <div className="border-t pt-12 px-4 min-h-[80vh]">
      <div className="text-2xl mb-8">
        <Title text1={"MY"} text2={"ADDRESSES"} />
      </div>

      {addresses.length === 0 ? (
        <p className="text-gray-500">No saved addresses found.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {addresses.map((addr, index) => (
            <div
              key={index}
              className="border p-5 rounded-lg shadow-sm bg-white"
            >
              {/* FULL NAME */}
              <p className="font-medium text-base">
                {addr.name}
              </p>

              {/* MOBILE */}
              <p className="text-sm text-gray-600 mt-1">
                {addr.phone}
              </p>

              {/* FULL ADDRESS FORMAT */}
              <div className="text-sm text-gray-600 mt-3 space-y-1">
                <p>{addr.flat}</p>
                <p>{addr.area}</p>

                {addr.landmark && (
                  <p>Landmark: {addr.landmark}</p>
                )}

                <p>
                  {addr.city}, {addr.state} - {addr.pincode}
                </p>

                <p>{addr.country}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Address;
