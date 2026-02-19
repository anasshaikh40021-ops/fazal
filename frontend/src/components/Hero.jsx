import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'

const Hero = () => {
  const { products, currency } = useContext(ShopContext)
  const navigate = useNavigate()

  // ✅ ONLY banner products
  const bannerProducts = useMemo(
    () => products.filter((p) => p.showOnBanner),
    [products]
  )

  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (bannerProducts.length === 0) return

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % bannerProducts.length)
    }, 900)

    return () => clearInterval(interval)
  }, [bannerProducts])

  if (bannerProducts.length === 0) return null

  const product = bannerProducts[index]

  return (
    <div className="flex flex-col sm:flex-row border border-gray-400 overflow-hidden h-[380px] sm:h-[420px]">

      <div className="w-full sm:w-1/2 flex items-center justify-center px-6">
        <div className="text-[#414141] max-w-sm transition-all duration-500">

          <div className="flex items-center gap-2 mb-2">
            <p className="w-7 h-[2px] bg-[#414141]" />
            <p className="font-medium text-sm">
              FEATURED
            </p>
          </div>

          <h1 className="prata-regular text-2xl lg:text-4xl leading-snug">
            {product.name}
          </h1>

          <p className="text-lg font-semibold mt-2">
            {currency}{product.price}
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

      <div
        onClick={() => navigate(`/product/${product._id}`)}
        className="w-full sm:w-1/2 cursor-pointer"
      >
        <img
          key={product._id}
          src={product.image[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-500 ease-in-out"
        />
      </div>

    </div>
  )
}

export default Hero
