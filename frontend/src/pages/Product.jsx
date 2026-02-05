import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets'
import RelatedProducts from '../components/RelatedProducts'
import axios from 'axios'
import { toast } from 'react-toastify'

const Product = () => {
  const { productId } = useParams()
  const { products, currency, addToCart, backendUrl, token } = useContext(ShopContext)

  const [productData, setProductData] = useState(null)
  const [image, setImage] = useState('')
  const [size, setSize] = useState('')

  // ⭐ Reviews State
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')

  // ------------------------
  // Fetch Product
  // ------------------------
  useEffect(() => {
    const foundProduct = products.find((item) => item._id === productId)
    if (foundProduct) {
      setProductData(foundProduct)
      setImage(foundProduct.image[0])
      setSize('')
    }
  }, [productId, products])

  // ------------------------
  // Fetch Reviews
  // ------------------------
  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/reviews/${productId}`)
      setReviews(res.data || [])
    } catch (error) {
      console.log('Fetch reviews error:', error)
      setReviews([])
    }
  }

  useEffect(() => {
    fetchReviews()
    window.scrollTo(0, 0)
  }, [productId])

  // ------------------------
  // Submit Review
  // ------------------------
  const submitReview = async () => {
    if (!token) {
      toast.error('Login to submit review')
      return
    }

    if (!rating || !comment.trim()) {
      toast.error('Please add rating and comment')
      return
    }

    try {
      await axios.post(
        `${backendUrl}/api/reviews/${productId}`,
        { rating, comment },
        { headers: { token } }
      )

      toast.success('Review submitted')
      setRating(0)
      setHoverRating(0)
      setComment('')
      fetchReviews()
    } catch (error) {
      console.log('Submit review error:', error)
      toast.error(error.response?.data?.message || 'Error submitting review')
    }
  }

  // ------------------------
  // Average Rating
  // ------------------------
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
          reviews.length
        ).toFixed(1)
      : 0

  if (!productData) return <div className="opacity-0" />

  return (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">

      {/* TOP SECTION */}
      <div className="flex gap-12 flex-col sm:flex-row">

        {/* IMAGES */}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll sm:w-[18.7%] w-full">
            {productData.image.map((item, index) => (
              <img
                onClick={() => setImage(item)}
                src={item}
                key={index}
                className="w-[24%] sm:w-full sm:mb-3 cursor-pointer"
                alt=""
              />
            ))}
          </div>

          <div className="w-full sm:w-[80%]">
            <img className="w-[90%]" src={image} alt="" />
          </div>
        </div>

        {/* PRODUCT INFO */}
        <div className="flex-1">
          <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>

          {/* ⭐ AVERAGE STARS */}
          <div className="flex items-center gap-1 mt-2">
            {[1,2,3,4,5].map((i) => (
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
            <p className="pl-2 text-sm">({reviews.length})</p>
            <p className="pl-1 text-sm text-gray-500">{averageRating}</p>
          </div>

          <p className="mt-5 text-3xl font-medium">
            {currency}{productData.price}
          </p>

          <p className="mt-5 text-gray-500">
            {productData.description}
          </p>

          {/* SIZE */}
          <div className="flex flex-col gap-4 my-8">
            <p>Select Size</p>
            <div className="flex gap-2">
              {productData.sizes.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setSize(item)}
                  className={`border py-2 px-4 bg-gray-100 ${
                    item === size ? 'border-orange-500' : ''
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              if (!size) {
                toast.error('Please select a size')
                return
              }
              addToCart(productData._id, size)
            }}
            className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700"
          >
            ADD TO CART
          </button>
        </div>
      </div>

      {/* REVIEWS SECTION */}
      <div className="mt-20">

        {/* ADD REVIEW */}
        <div className="border px-6 py-6 mt-6">
          <h3 className="font-medium mb-3">Add a Review</h3>

          {/* ⭐ HOVER STARS */}
          <div className="flex gap-2 mb-3">
            {[1,2,3,4,5].map((i) => (
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
                className="w-6 cursor-pointer transition-transform hover:scale-110"
                alt=""
              />
            ))}
          </div>

          <textarea
            className="w-full border p-2 text-sm"
            placeholder="Write your review..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <button
            onClick={submitReview}
            className="bg-black text-white px-6 py-2 text-sm mt-3"
          >
            Submit Review
          </button>
        </div>

        {/* SHOW REVIEWS */}
        <div className="border px-6 py-6 mt-6">
          <h3 className="font-medium mb-3">Customer Reviews</h3>

          {reviews.length === 0 ? (
            <p className="text-gray-500 text-sm">No reviews yet.</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev._id} className="border-b py-4">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((i) => (
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
                <p className="text-sm text-gray-600 mt-1">
                  {rev.comment}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
      />
    </div>
  )
}

export default Product
