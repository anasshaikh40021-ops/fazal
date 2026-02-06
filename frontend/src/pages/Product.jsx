import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import RelatedProducts from "../components/RelatedProducts";
import axios from "axios";
import { toast } from "react-toastify";

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart, backendUrl, token } =
    useContext(ShopContext);

  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");

  /* ---------------- REVIEWS ---------------- */
  const [reviews, setReviews] = useState([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  /* ---------------- FETCH PRODUCT ---------------- */
  useEffect(() => {
    const found = products.find((p) => p._id === productId);
    if (found) {
      setProductData(found);
      setImage(found.image[0]);
      setSize("");
    }
  }, [productId, products]);

  /* ---------------- FETCH REVIEWS ---------------- */
  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/review/${productId}`
      );
      setReviews(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchReviews();
    window.scrollTo(0, 0);
  }, [productId]);

  /* ---------------- SUBMIT REVIEW ---------------- */
  const submitReview = async () => {
    if (!token) {
      toast.error("Login to submit review");
      return;
    }

    if (!rating || !comment.trim()) {
      toast.error("Rating & comment required");
      return;
    }

    try {
      await axios.post(
        `${backendUrl}/api/review/${productId}`,
        { rating, comment },
        { headers: { token } }
      );

      toast.success("Review added");
      setRating(0);
      setHoverRating(0);
      setComment("");
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || "Review failed");
    }
  };

  /* ---------------- AVERAGE RATING ---------------- */
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : 0;

  if (!productData) return null;

  return (
    <div className="border-t-2 pt-10">

      {/* PRODUCT SECTION */}
      <div className="flex gap-12 flex-col sm:flex-row">
        <div className="flex-1 flex flex-col-reverse sm:flex-row gap-3">
          <div className="flex sm:flex-col overflow-x-auto sm:w-[18%]">
            {productData.image.map((img, i) => (
              <img
                key={i}
                src={img}
                onClick={() => setImage(img)}
                className="w-[24%] sm:w-full cursor-pointer"
                alt=""
              />
            ))}
          </div>

          <div className="sm:w-[80%]">
            <img src={image} className="w-[90%]" alt="" />
          </div>
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-medium">{productData.name}</h1>

          <div className="flex items-center gap-1 mt-2">
            {[1,2,3,4,5].map(i => (
              <img
                key={i}
                src={i <= Math.round(averageRating) ? assets.star_icon : assets.star_dull_icon}
                className="w-3"
              />
            ))}
            <span className="text-sm ml-2">({reviews.length}) {averageRating}</span>
          </div>

          <p className="mt-4 text-3xl">{currency}{productData.price}</p>
          <p className="mt-4 text-gray-500">{productData.description}</p>

          <div className="mt-6">
            <p>Select Size</p>
            <div className="flex gap-2 mt-2">
              {productData.sizes.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setSize(s)}
                  className={`border px-4 py-2 ${
                    size === s ? "border-orange-500" : ""
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              if (!size) return toast.error("Select size");
              addToCart(productData._id, size);
            }}
            className="bg-black text-white px-8 py-3 mt-6"
          >
            ADD TO CART
          </button>
        </div>
      </div>

      {/* ADD REVIEW */}
      <div className="border px-6 py-6 mt-16">
        <h3 className="font-medium mb-3">Add a Review</h3>

        <div className="flex gap-2 mb-3">
          {[1,2,3,4,5].map(i => (
            <img
              key={i}
              onMouseEnter={() => setHoverRating(i)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(i)}
              src={i <= (hoverRating || rating) ? assets.star_icon : assets.star_dull_icon}
              className="w-6 cursor-pointer"
            />
          ))}
        </div>

        <textarea
          className="w-full border p-2"
          placeholder="Write your review..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <button
          onClick={submitReview}
          className="bg-black text-white px-6 py-2 mt-3"
        >
          Submit Review
        </button>
      </div>

      {/* REVIEWS LIST */}
      <div className="border px-6 py-6 mt-6">
        <h3 className="font-medium mb-3">Customer Reviews</h3>

        {(showAllReviews ? reviews : reviews.slice(0, 3)).map((rev) => (
          <div key={rev._id} className="border-b py-4">
            <div className="flex gap-1">
              {[1,2,3,4,5].map(i => (
                <img
                  key={i}
                  src={i <= rev.rating ? assets.star_icon : assets.star_dull_icon}
                  className="w-3"
                />
              ))}
            </div>
            <p className="text-sm mt-1">{rev.comment}</p>
            <p className="text-xs text-gray-500">— {rev.user?.name}</p>
          </div>
        ))}

        {reviews.length > 3 && (
          <button
            onClick={() => setShowAllReviews(!showAllReviews)}
            className="text-blue-600 text-sm mt-3"
          >
            {showAllReviews ? "Show Less" : "Read More"}
          </button>
        )}
      </div>

      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
      />
    </div>
  );
};

export default Product;
