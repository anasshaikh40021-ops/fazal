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
    setIsPreviewing(false)
    setCurrentImageIndex(0)
  }

  const handleClick = () => {
    // Mobile logic
    if (window.innerWidth <= 768 && image.length > 1 && !isPreviewing) {
      setIsPreviewing(true)

      const interval = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % image.length)
      }, 700)

      setTimeout(() => {
        clearInterval(interval)
        setIsPreviewing(false)
        setCurrentImageIndex(0)
      }, 2000)

      return
    }

    // Second tap or desktop → navigate
    navigate(`/product/${id}`)
  }

  return (
    <div
      className="text-gray-700 cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
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
