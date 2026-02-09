import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import { toast } from "react-toastify";

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate } =
    useContext(ShopContext);

  const [cartData, setCartData] = useState([]);

  /* ---------------- BUILD CART DATA ---------------- */
  useEffect(() => {
    const temp = [];

    for (const productId in cartItems) {
      for (const size in cartItems[productId]) {
        if (cartItems[productId][size] > 0) {
          temp.push({
            _id: productId,
            size,
            quantity: cartItems[productId][size],
          });
        }
      }
    }

    setCartData(temp);
  }, [cartItems]);

  /* ---------------- CHECKOUT HANDLER ---------------- */
  const handleCheckout = () => {
    if (cartData.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    navigate("/place-order");
  };

  return (
    <div className="border-t pt-4 pb-32 sm:pb-10">
      {/* TITLE */}
      <div className="mb-4">
        <Title text1="YOUR" text2="CART" />
      </div>

      {/* CART ITEMS */}
      {cartData.length === 0 && (
        <p className="text-center text-gray-500 py-10">
          Your cart is empty
        </p>
      )}

      {cartData.map((item, index) => {
        const product = products.find((p) => p._id === item._id);
        if (!product) return null;

        return (
          <div
            key={index}
            className="border-b py-4 flex flex-col gap-4 sm:grid sm:grid-cols-[4fr_2fr_0.5fr] sm:items-center"
          >
            {/* PRODUCT INFO */}
            <div className="flex gap-4">
              <img
                src={product.image[0]}
                alt={product.name}
                className="w-20 h-20 object-cover rounded"
              />

              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {currency}
                  {product.price} • Size {item.size}
                </p>
              </div>
            </div>

            {/* QUANTITY */}
            <div className="flex items-center justify-between sm:justify-start gap-6">
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) =>
                  updateQuantity(
                    item._id,
                    item.size,
                    Number(e.target.value)
                  )
                }
                className="border w-16 py-2 text-center rounded-md"
              />

              <img
                onClick={() => updateQuantity(item._id, item.size, 0)}
                src={assets.bin_icon}
                alt="remove"
                className="w-5 cursor-pointer"
              />
            </div>
          </div>
        );
      })}

      {/* CART TOTAL (DESKTOP + MOBILE NORMAL FLOW) */}
      <div className="flex justify-end my-10">
        <div className="w-full sm:w-[450px]">
          <CartTotal />

          {/* DESKTOP CHECKOUT BUTTON */}
          <button
            onClick={handleCheckout}
            className="hidden sm:block w-full bg-black text-white py-3 mt-6 text-sm hover:bg-gray-800 transition"
          >
            PROCEED TO CHECKOUT
          </button>
        </div>
      </div>

      {/* MOBILE STICKY CHECKOUT BAR */}
      {cartData.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-white border-t p-4 z-40">
          <button
            onClick={handleCheckout}
            className="w-full bg-black text-white py-4 rounded-md text-lg"
          >
            Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
