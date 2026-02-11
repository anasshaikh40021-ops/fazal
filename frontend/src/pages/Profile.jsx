import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";

const tabs = ["Profile", "Orders", "Addresses", "Security"];

const Profile = () => {
  const { backendUrl, token, navigate, user, setUser } =
    useContext(ShopContext);

  const [activeTab, setActiveTab] = useState("Profile");
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Orders
  const [orders, setOrders] = useState([]);

  // Addresses
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Security
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  /* ---------------- AUTH GUARD ---------------- */
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (!token && !savedToken) {
      navigate("/login");
    } else {
      setAuthChecked(true);
    }
  }, [token, navigate]);

  /* ---------------- LOAD USER ---------------- */
  useEffect(() => {
    if (!user) return;

    setName(user.name || "");
    setPreview(user.profileImage || "");
    setAddresses(user.addresses || []);
  }, [user]);

  /* ---------------- IMAGE PREVIEW ---------------- */
  useEffect(() => {
    if (!image) return;
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  /* ---------------- FETCH ORDERS ---------------- */
  const fetchOrders = async () => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/order/userorders`,
        {},
        { headers: { token } }
      );
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      toast.error("Failed to load orders");
    }
  };

  useEffect(() => {
    if (activeTab === "Orders") {
      fetchOrders();
    }
  }, [activeTab]);

  /* ---------------- UPDATE PROFILE ---------------- */
  const updateProfile = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", name);
      if (image) formData.append("image", image);

      const res = await axios.put(
        `${backendUrl}/api/user/update-profile`,
        formData,
        { headers: { token } }
      );

      if (res.data.success) {
        setUser(res.data.user);
        setImage(null);
        toast.success("Profile updated");
      }
    } catch {
      toast.error("Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- ADD ADDRESS ---------------- */
  const handleAddAddress = async () => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/user/add-address`,
        newAddress,
        { headers: { token } }
      );

      if (res.data.success) {
        setAddresses(res.data.addresses);
        setUser({ ...user, addresses: res.data.addresses });
        toast.success("Address added");
        setNewAddress({
          name: "",
          phone: "",
          address: "",
          city: "",
          state: "",
          pincode: "",
        });
      }
    } catch {
      toast.error("Failed to add address");
    }
  };

  /* ---------------- DELETE ADDRESS ---------------- */
  const handleDeleteAddress = async (index) => {
    try {
      const res = await axios.delete(
        `${backendUrl}/api/user/delete-address`,
        {
          headers: { token },
          data: { index },
        }
      );

      if (res.data.success) {
        setAddresses(res.data.addresses);
        setUser({ ...user, addresses: res.data.addresses });
        toast.success("Address removed");
      }
    } catch {
      toast.error("Failed to delete address");
    }
  };

  /* ---------------- CHANGE PASSWORD ---------------- */
  const handleChangePassword = async () => {
    try {
      const res = await axios.put(
        `${backendUrl}/api/user/change-password`,
        { currentPassword, newPassword },
        { headers: { token } }
      );

      if (res.data.success) {
        toast.success("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Failed to change password");
    }
  };

  if (!authChecked || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow">
        <div className="flex border-b">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm ${
                activeTab === tab
                  ? "border-b-2 border-black font-medium"
                  : "text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-4">
          {activeTab === "Profile" && (
            <>
              <div className="flex flex-col items-center gap-4">
                <img
                  src={
                    preview ||
                    "https://ui-avatars.com/api/?name=User&background=random"
                  }
                  className="w-24 h-24 rounded-full object-cover border"
                  alt="profile"
                />
                <input
                  type="file"
                  hidden
                  id="upload"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                />
                <label
                  htmlFor="upload"
                  className="text-blue-600 text-xs cursor-pointer"
                >
                  Change Photo
                </label>
              </div>

              <div className="mt-6">
                <label className="text-xs text-gray-600">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border p-2 rounded mt-1 text-sm"
                />
              </div>

              <div className="mt-4">
                <label className="text-xs text-gray-600">Email</label>
                <input
                  value={user.email}
                  disabled
                  className="w-full border p-2 rounded bg-gray-100 mt-1 text-sm"
                />
              </div>

              <button
                onClick={updateProfile}
                disabled={loading}
                className="w-full bg-black text-white py-2 rounded mt-6 text-sm"
              >
                Save Changes
              </button>
            </>
          )}

          {activeTab === "Orders" && (
            <div>
              {orders.length === 0 ? (
                <p className="text-sm text-gray-500">No orders found</p>
              ) : (
                orders.map((order) => (
                  <div
                    key={order._id}
                    className="border p-3 mb-3 rounded text-sm"
                  >
                    <p>Amount: ₹{order.amount}</p>
                    <p>Status: {order.status}</p>
                    <p>
                      Date: {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "Addresses" && (
            <div>
              {addresses.map((addr, i) => (
                <div key={i} className="border p-3 mb-3 rounded text-sm">
                  <p>{addr.name}</p>
                  <p>{addr.address}</p>
                  <p>
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <button
                    onClick={() => handleDeleteAddress(i)}
                    className="text-red-500 text-xs mt-2"
                  >
                    Delete
                  </button>
                </div>
              ))}

              <div className="space-y-2 mt-4">
                {Object.keys(newAddress).map((key) => (
                  <input
                    key={key}
                    placeholder={key}
                    value={newAddress[key]}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        [key]: e.target.value,
                      })
                    }
                    className="w-full border p-2 rounded text-sm"
                  />
                ))}
                <button
                  onClick={handleAddAddress}
                  className="w-full bg-black text-white py-2 rounded text-sm"
                >
                  Add Address
                </button>
              </div>
            </div>
          )}

          {activeTab === "Security" && (
            <div className="space-y-3">
              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border p-2 rounded text-sm"
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border p-2 rounded text-sm"
              />
              <button
                onClick={handleChangePassword}
                className="w-full bg-black text-white py-2 rounded text-sm"
              >
                Change Password
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
