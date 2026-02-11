import axios from "axios";
import React, { useEffect, useState } from "react";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingStock, setEditingStock] = useState({});

  /* =============================
     FETCH PRODUCT LIST
  ============================== */
  const fetchList = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${backendUrl}/api/product/list`
      );

      if (response.data.success) {
        setList(response.data.products || []);
      } else {
        toast.error(response.data.message || "Failed to load products");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching product list");
    } finally {
      setLoading(false);
    }
  };

  /* =============================
     REMOVE PRODUCT
  ============================== */
  const removeProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      const response = await axios.post(
        `${backendUrl}/api/product/remove`,
        { id },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Product removed");
        fetchList();
      } else {
        toast.error(response.data.message || "Remove failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error removing product");
    }
  };

  /* =============================
     UPDATE STOCK
  ============================== */
  const updateStock = async (productId, size) => {
    const newStock = editingStock[`${productId}-${size}`];

    if (newStock === undefined || newStock === "") {
      toast.error("Enter stock value");
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/product/update-stock`,
        {
          productId,
          size,
          stock: Number(newStock),
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Stock updated");
        fetchList();
        setEditingStock({});
      } else {
        toast.error(response.data.message || "Stock update failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating stock");
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="p-4">
      <p className="text-lg font-semibold mb-4">
        All Product List
      </p>

      {loading && (
        <p className="text-sm text-gray-500 mb-4">
          Loading products...
        </p>
      )}

      <div className="space-y-4">
        {list.map((item) => (
          <div
            key={item._id}
            className="border rounded-xl shadow-sm p-4 bg-white"
          >
            {/* TOP SECTION */}
            <div className="flex gap-4">
              <img
                src={item.image?.[0]}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg"
              />

              <div className="flex-1">
                <p className="font-semibold text-base">
                  {item.name}
                </p>
                <p className="text-sm text-gray-500">
                  {item.category}
                </p>
                <p className="font-medium mt-1">
                  {currency}
                  {item.price}
                </p>
              </div>

              <button
                onClick={() => removeProduct(item._id)}
                className="text-red-500 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* SIZE & STOCK SECTION */}
            <div className="mt-4 space-y-2">
              {item.sizes?.map((s, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center gap-2"
                >
                  <span
                    className={`text-xs px-3 py-1 rounded-full border w-fit ${
                      s.stock === 0
                        ? "border-red-400 text-red-500 bg-red-50"
                        : "border-green-400 text-green-600 bg-green-50"
                    }`}
                  >
                    {s.size} • {s.stock} in stock
                  </span>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="New stock"
                      className="border px-3 py-1 text-sm rounded w-24"
                      value={
                        editingStock[`${item._id}-${s.size}`] || ""
                      }
                      onChange={(e) =>
                        setEditingStock({
                          ...editingStock,
                          [`${item._id}-${s.size}`]:
                            e.target.value,
                        })
                      }
                    />

                    <button
                      onClick={() =>
                        updateStock(item._id, s.size)
                      }
                      className="bg-black text-white text-sm px-3 py-1 rounded hover:bg-gray-800"
                    >
                      Update
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default List;
