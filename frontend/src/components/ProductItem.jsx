import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom'

const ProductItem = ({ id, image, name, price }) => {
  const { currency } = useContext(ShopContext)

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    if (!hovered || image.length <= 1) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % image.length)
    }, 700) // smooth & fast

    return () => clearInterval(interval)
  }, [hovered, image])

  const handleMouseEnter = () => {
    setHovered(true)
  }

  const handleMouseLeave = () => {
    setHovered(false)
    setCurrentImageIndex(0)
  }

  return (
    <Link
      to={`/product/${id}`}
      className="text-gray-700 cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="overflow-hidden">
        <img
          src={image[currentImageIndex]}
          alt={name}
          className="transition-all duration-500 ease-in-out hover:scale-110"
        />
      </div>

      <p className="pt-3 pb-1 text-sm">{name}</p>
      <p className="text-sm font-medium">{currency}{price}</p>
    </Link>
  )
}

export default ProductItem
