import React, { useContext, useEffect, useState } from 'react';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const PlaceOrder = () => {

  const [method, setMethod] = useState('cod');

  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
    products
  } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: ''
  });

  /* 🔒 Protect page if cart empty */
  useEffect(() => {
    let hasItems = false;

    for (const p in cartItems) {
      for (const s in cartItems[p]) {
        if (cartItems[p][s] > 0) hasItems = true;
      }
    }

    if (!hasItems) navigate('/cart');
  }, []);

  const onChangeHandler = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /* =========================
     ✅ FIXED BUILD ORDER ITEMS
     BACKEND NEEDS: itemId
  ========================== */
  const buildOrderItems = () => {
    let orderItems = [];

    for (const p in cartItems) {
      for (const s in cartItems[p]) {
        if (cartItems[p][s] > 0) {
          const product = products.find(pr => pr._id === p);

          if (product) {
            orderItems.push({
              itemId: product._id,   // ✅ REQUIRED BY BACKEND
              size: s,
              quantity: cartItems[p][s],
              name: product.name,
              price: product.price,
              image: product.image
            });
          }
        }
      }
    }

    return orderItems;
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const orderItems = buildOrderItems();

      if (orderItems.length === 0) {
        toast.error("Your cart is empty");
        navigate('/cart');
        return;
      }

      const orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee
      };

      /* ================= COD ================= */
      if (method === 'cod') {
        const res = await axios.post(
          backendUrl + '/api/order/place',
          orderData,
          { headers: { token } }
        );

        if (res.data.success) {
          toast.success("Order placed successfully");
          setCartItems({});
          navigate('/orders');
        } else {
          toast.error(res.data.message);
        }
      }

      /* ============ RAZORPAY ============ */
      if (method === 'razorpay') {

        const { data } = await axios.post(
          backendUrl + '/api/order/razorpay',
          orderData,
          { headers: { token } }
        );

        if (!data.success) {
          toast.error("Payment initiation failed");
          navigate('/cart');
          return;
        }

        const options = {
          key: data.key,
          amount: data.amount,
          currency: "INR",
          name: "Fazal Shop",
          description: "Order Payment",
          order_id: data.orderId,

          handler: async (response) => {
            try {
              const verifyRes = await axios.post(
                backendUrl + '/api/order/verify-razorpay',
                response,
                { headers: { token } }
              );

              if (verifyRes.data.success) {
                toast.success("Razorpay payment successful ✅");
                setCartItems({});
                navigate('/orders');
              } else {
                toast.error("Payment verification failed");
                navigate('/cart');
              }

            } catch (err) {
              toast.error("Payment failed");
              navigate('/cart');
            }
          },

          modal: {
            ondismiss: function () {
              toast.error("Payment cancelled");
              navigate('/cart');
            }
          },

          prefill: {
            email: formData.email,
            contact: formData.phone
          },

          theme: { color: "#000000" }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Order failed");
      navigate('/cart');
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'
    >

      {/* DELIVERY INFO */}
      <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>

        <div className='text-xl sm:text-2xl my-3'>
          <Title text1={'DELIVERY'} text2={'INFORMATION'} />
        </div>

        <div className='flex gap-3'>
          <input required name='firstName' value={formData.firstName} onChange={onChangeHandler} className='border px-3 py-1.5 w-full' placeholder='First name' />
          <input required name='lastName' value={formData.lastName} onChange={onChangeHandler} className='border px-3 py-1.5 w-full' placeholder='Last name' />
        </div>

        <input required name='email' value={formData.email} onChange={onChangeHandler} className='border px-3 py-1.5 w-full' type='email' placeholder='Email' />
        <input required name='street' value={formData.street} onChange={onChangeHandler} className='border px-3 py-1.5 w-full' placeholder='Street' />

        <div className='flex gap-3'>
          <input required name='city' value={formData.city} onChange={onChangeHandler} className='border px-3 py-1.5 w-full' placeholder='City' />
          <input required name='state' value={formData.state} onChange={onChangeHandler} className='border px-3 py-1.5 w-full' placeholder='State' />
        </div>

        <div className='flex gap-3'>
          <input required name='zipcode' value={formData.zipcode} onChange={onChangeHandler} className='border px-3 py-1.5 w-full' type='number' placeholder='Zipcode' />
          <input required name='country' value={formData.country} onChange={onChangeHandler} className='border px-3 py-1.5 w-full' placeholder='Country' />
        </div>

        <input required name='phone' value={formData.phone} onChange={onChangeHandler} className='border px-3 py-1.5 w-full' type='number' placeholder='Phone' />
      </div>

      {/* CART + PAYMENT */}
      <div className='mt-8'>
        <div className='min-w-80'>
          <CartTotal />
        </div>

        <div className='mt-12'>
          <Title text1={'PAYMENT'} text2={'METHOD'} />

          <div className='flex gap-3 flex-col'>
            <div onClick={() => setMethod('razorpay')} className='flex items-center gap-3 border p-3 cursor-pointer'>
              <span className={`w-4 h-4 border rounded-full ${method === 'razorpay' ? 'bg-green-500' : ''}`}></span>
              <p className='text-sm'>UPI / PhonePe / GPay</p>
            </div>

            <div onClick={() => setMethod('cod')} className='flex items-center gap-3 border p-3 cursor-pointer'>
              <span className={`w-4 h-4 border rounded-full ${method === 'cod' ? 'bg-green-500' : ''}`}></span>
              <p className='text-sm'>Cash on Delivery</p>
            </div>
          </div>
        </div>

        <div className='w-full text-end mt-8'>
          <button className='bg-black text-white px-16 py-3 text-sm'>
            PLACE ORDER
          </button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
