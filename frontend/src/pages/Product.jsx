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
      setImage(found.image?.[0] || "");
      setSize("");
    }
  }, [productId, products]);

  /* ---------------- FETCH REVIEWS ---------------- */
  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/review/${productId}`
      );
      setReviews(data || []);
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

  /* ---------------- SIZE + STOCK LOGIC ---------------- */
  const getStockForSize = (sizeValue) => {
    const sizeObj = productData.sizes?.find(
      (s) => s.size === sizeValue
    );
    return sizeObj ? Number(sizeObj.stock) : 0;
  };

  const selectedStock = size ? getStockForSize(size) : null;
  const isOutOfStock = selectedStock === 0;

  return (
    <div className="border-t-2 pt-10">
      {/* PRODUCT SECTION */}
      <div className="flex gap-12 flex-col sm:flex-row">
        {/* IMAGES */}
        <div className="flex-1 flex flex-col-reverse sm:flex-row gap-3">
          <div className="flex sm:flex-col overflow-x-auto sm:w-[18%]">
            {productData.image?.map((img, i) => (
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
            <img
              src={image}
              className="w-[90%]"
              alt={productData.name}
            />
          </div>
        </div>

        {/* PRODUCT INFO */}
        <div className="flex-1">
          <h1 className="text-2xl font-medium">
            {productData.name}
          </h1>

          {/* RATING */}
          <div className="flex items-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <img
                key={i}
                src={
                  i <= Math.round(averageRating)
                    ? assets.star_icon
                    : assets.star_dull_icon
                }
                className="w-3"
                alt=""
              />
            ))}
            <span className="text-sm ml-2">
              ({reviews.length}) {averageRating}
            </span>
          </div>

          <p className="mt-4 text-3xl">
            {currency}
            {productData.price}
          </p>

          <p className="mt-4 text-gray-500">
            {productData.description}
          </p>

          {/* -------- SIZE SELECTION -------- */}
          <div className="mt-6">
            <p className="font-medium">Select Size</p>

            <div className="flex gap-2 mt-2 flex-wrap">
              {productData.sizes && productData.sizes.length > 0 ? (
                productData.sizes.map((s, i) => {
                  const stock = Number(s.stock);

                  return (
                    <button
                      key={i}
                      onClick={() => setSize(s.size)}
                      disabled={stock === 0}
                      className={`border px-4 py-2 transition
                        ${
                          size === s.size
                            ? "border-orange-500"
                            : ""
                        }
                        ${
                          stock === 0
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:border-black"
                        }`}
                      title={
                        stock === 0
                          ? "Out of stock"
                          : `Stock: ${stock}`
                      }
                    >
                      {s.size}
                    </button>
                  );
                })
              ) : (
                <p className="text-red-500 text-sm">
                  No sizes available for this product
                </p>
              )}
            </div>

            {/* STOCK INFO */}
            {size && (
              <p className="text-sm mt-2 text-gray-600">
                Stock for {size}:{" "}
                <span
                  className={
                    selectedStock === 0
                      ? "text-red-500 font-medium"
                      : "text-green-600 font-medium"
                  }
                >
                  {selectedStock}
                </span>
              </p>
            )}
          </div>

          {/* -------- ADD TO CART -------- */}
          <button
            disabled={!size || isOutOfStock}
            onClick={() => {
              if (!size)
                return toast.error("Select size first");

              if (isOutOfStock)
                return toast.error("This size is out of stock");

              addToCart(productData._id, size);
            }}
            className="bg-black text-white px-8 py-3 mt-6 disabled:opacity-50"
          >
            {isOutOfStock ? "OUT OF STOCK" : "ADD TO CART"}
          </button>
        </div>
      </div>

      {/* ADD REVIEW */}
      <div className="border px-6 py-6 mt-16">
        <h3 className="font-medium mb-3">Add a Review</h3>

        <div className="flex gap-2 mb-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <img
              key={i}
              onMouseEnter={() => setHoverRating(i)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(i)}
              src={
                i <= (hoverRating || rating)
                  ? assets.star_icon
                  : assets.star_dull_icon
              }
              className="w-6 cursor-pointer"
              alt=""
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
        <h3 className="font-medium mb-3">
          Customer Reviews
        </h3>

        {(showAllReviews ? reviews : reviews.slice(0, 3)).map(
          (rev) => (
            <div key={rev._id} className="border-b py-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <img
                    key={i}
                    src={
                      i <= rev.rating
                        ? assets.star_icon
                        : assets.star_dull_icon
                    }
                    className="w-3"
                    alt=""
                  />
                ))}
              </div>

              <p className="text-sm mt-1">
                {rev.comment}
              </p>

              <p className="text-xs text-gray-500">
                — {rev.user?.name || "User"}
              </p>
            </div>
          )
        )}

        {reviews.length > 3 && (
          <button
            onClick={() =>
              setShowAllReviews(!showAllReviews)
            }
            className="text-blue-600 text-sm mt-3"
          >
            {showAllReviews
              ? "Show Less"
              : "Read More"}
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
