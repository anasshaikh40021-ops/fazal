import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useNavigate } from 'react-router-dom'

const ProductItem = ({ id, image, name, price }) => {
  const { currency } = useContext(ShopContext)
  const navigate = useNavigate()

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isPreviewing, setIsPreviewing] = useState(false)

  /* ================= DESKTOP HOVER ================= */
  useEffect(() => {
    if (!isPreviewing || image.length <= 1) return

    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % image.length)
    }, 700)

    return () => clearInterval(interval)
  }, [isPreviewing, image])

  /* ================= EVENTS ================= */
  const handleMouseEnter = () => {
    if (window.innerWidth > 768) {
      setIsPreviewing(true)
    }
  }

  const handleMouseLeave = () => {
    if (window.innerWidth > 768) {
      setIsPreviewing(false)
      setCurrentImageIndex(0)
    }
  }

  const handleClick = () => {
    // Always navigate on click (both desktop & mobile)
    navigate(`/product/${id}`)
  }

  /* ================= MOBILE IMAGE SWIPE ================= */
  const handleTouchStart = () => {
    if (window.innerWidth <= 768 && image.length > 1) {
      setIsPreviewing(true)
    }
  }

  const handleTouchEnd = () => {
    if (window.innerWidth <= 768 && image.length > 1) {
      setIsPreviewing(false)
      setCurrentImageIndex(0)
    }
  }

  return (
    <div
      className="text-gray-700 cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="overflow-hidden">
        <img
          src={image[currentImageIndex]}
          alt={name}
          className="transition-all duration-500 ease-in-out"
        />
      </div>

      <p className="pt-3 pb-1 text-sm">{name}</p>
      <p className="text-sm font-medium">{currency}{price}</p>
    </div>
  )
}

export default ProductItem
