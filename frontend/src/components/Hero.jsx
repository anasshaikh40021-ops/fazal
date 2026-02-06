import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'

const Hero = () => {
  const { products, currency } = useContext(ShopContext)
  const navigate = useNavigate()

  const bestSellers = useMemo(
    () => products.filter((p) => p.bestseller),
    [products]
  )

  const [index, setIndex] = useState(0)

  // Faster rotation (1.5s)
  useEffect(() => {
    if (bestSellers.length === 0) return

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % bestSellers.length)
    }, 1500)

    return () => clearInterval(interval)
  }, [bestSellers])

  if (bestSellers.length === 0) return null

  const product = bestSellers[index]

  return (
    <div className="flex flex-col sm:flex-row border border-gray-400 overflow-hidden h-[380px] sm:h-[420px]">

      {/* LEFT */}
      <div className="w-full sm:w-1/2 flex items-center justify-center px-6">
        <div className="text-[#414141] max-w-sm transition-all duration-500">

          <div className="flex items-center gap-2 mb-2">
            <p className="w-7 h-[2px] bg-[#414141]" />
            <p className="font-medium text-sm">
              BESTSELLER
            </p>
          </div>

          <h1 className="prata-regular text-2xl lg:text-4xl leading-snug">
            {product.name}
          </h1>

          <p className="text-lg font-semibold mt-2">
            {currency}{product.price}
          </p>

          <p className="text-orange-600 font-medium mt-1 text-sm">
            Hot Pick 🔥
          </p>

          <div
            onClick={() => navigate(`/product/${product._id}`)}
            className="flex items-center gap-2 mt-4 cursor-pointer"
          >
            <p className="font-semibold text-sm hover:underline">
              SHOP NOW
            </p>
            <p className="w-7 h-[1px] bg-[#414141]" />
          </div>

        </div>
      </div>

      {/* RIGHT IMAGE */}
      <div
        onClick={() => navigate(`/product/${product._id}`)}
        className="w-full sm:w-1/2 cursor-pointer"
      >
        <img
          key={product._id}
          src={product.image[0]}
          alt={product.name}
          className="
            w-full h-full object-cover
            transition-all duration-500 ease-in-out
          "
        />
      </div>

    </div>
  )
}

export default Hero
