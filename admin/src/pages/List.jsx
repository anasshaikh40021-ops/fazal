import axios from "axios";
import React, { useEffect, useState } from "react";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

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
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

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

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <>
      <p className="mb-3 font-medium">All Product List</p>

      {loading && (
        <p className="text-sm text-gray-500 mb-2">
          Loading products...
        </p>
      )}

      <div className="flex flex-col gap-2">
        {/* ================= HEADER ================= */}
        <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-2 px-3 border bg-gray-100 text-sm font-medium">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b className="text-center">Action</b>
        </div>

        {/* ================= PRODUCT ROWS ================= */}
        {list.length === 0 && !loading && (
          <p className="text-sm text-gray-500 px-3 py-4">
            No products found.
          </p>
        )}

        {list.map((item) => (
          <div
            key={item._id}
            className="grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-2 px-3 border text-sm hover:bg-gray-50"
          >
            {/* IMAGE */}
            <img
              className="w-14 h-14 object-cover rounded"
              src={item.image?.[0]}
              alt={item.name}
            />

            {/* NAME */}
            <div>
              <p className="font-medium">{item.name}</p>

              {/* SHOW SIZE + STOCK (ADMIN DEBUG VIEW) */}
              {item.sizes && item.sizes.length > 0 && (
                <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
                  {item.sizes.map((s, i) => (
                    <span
                      key={i}
                      className={`px-2 py-[2px] border rounded ${
                        s.stock === 0
                          ? "border-red-400 text-red-500"
                          : "border-green-400 text-green-600"
                      }`}
                    >
                      {s.size}: {s.stock}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* CATEGORY */}
            <p>{item.category}</p>

            {/* PRICE */}
            <p>
              {currency}
              {item.price}
            </p>

            {/* ACTION */}
            <button
              onClick={() => removeProduct(item._id)}
              className="text-red-500 font-bold text-center hover:text-red-700"
              title="Delete Product"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default List;
