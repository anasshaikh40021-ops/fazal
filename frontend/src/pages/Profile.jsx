import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";

const tabs = ["Profile", "Orders", "Addresses", "Security"];

const Profile = () => {
  const {
    backendUrl,
    token,
    navigate,
    user,
    setUser,
  } = useContext(ShopContext);

  const [activeTab, setActiveTab] = useState("Profile");
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------------- AUTH GUARD ---------------- */
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  /* ---------------- LOAD USER ---------------- */
  useEffect(() => {
    if (!user) return;

    setName(user.name || "");
    setPreview(
      user.profileImage ? `${backendUrl}/${user.profileImage}` : ""
    );
  }, [user, backendUrl]);

  /* ---------------- IMAGE PREVIEW ---------------- */
  useEffect(() => {
    if (!image) return;

    const url = URL.createObjectURL(image);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [image]);

  /* ---------------- REMOVE PHOTO ---------------- */
  const removePhoto = async () => {
    try {
      const res = await axios.put(
        `${backendUrl}/api/user/update-profile`,
        { removeImage: true },
        { headers: { token } }
      );

      if (res.data.success) {
        const profileRes = await axios.get(
          `${backendUrl}/api/user/profile`,
          { headers: { token } }
        );

        setUser(profileRes.data.user);
        setPreview("");
        toast.success("Profile photo removed");
      }
    } catch (err) {
      toast.error("Failed to remove photo");
    }
  };

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
        const profileRes = await axios.get(
          `${backendUrl}/api/user/profile`,
          { headers: { token } }
        );

        setUser(profileRes.data.user);
        setImage(null);
        toast.success("Profile updated successfully");
      }
    } catch (err) {
      toast.error("Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow">
        {/* TABS */}
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

        {/* CONTENT */}
        <div className="p-4">
          {activeTab === "Profile" && (
            <>
              {/* IMAGE */}
              <div className="flex flex-col items-center gap-4">
                <img
                  src={
                    preview ||
                    "https://ui-avatars.com/api/?name=User&background=random"
                  }
                  className="w-24 h-24 rounded-full object-cover border"
                  alt="profile"
                />

                <div className="flex gap-4 text-xs">
                  <label className="cursor-pointer text-blue-600">
                    Change Photo
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => setImage(e.target.files[0])}
                    />
                  </label>

                  {user.profileImage && (
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="text-red-500"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>

              {/* NAME */}
              <div className="mt-6">
                <label className="text-xs text-gray-600">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border p-2 rounded mt-1 text-sm"
                />
              </div>

              {/* EMAIL */}
              <div className="mt-4">
                <label className="text-xs text-gray-600">Email</label>
                <input
                  value={user.email}
                  disabled
                  className="w-full border p-2 rounded bg-gray-100 mt-1 text-sm"
                />
              </div>

              {/* SAVE */}
              <button
                onClick={updateProfile}
                disabled={loading}
                className="w-full bg-black text-white py-2 rounded mt-6 text-sm disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </>
          )}

          {activeTab !== "Profile" && (
            <p className="text-sm text-gray-500">
              This section will be added next.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
