import React, { useState } from "react"
import { assets } from "../assets/assets"
import axios from "axios"
import { backendUrl } from "../App"
import { toast } from "react-toastify"

const Add = ({ token }) => {
  const [images, setImages] = useState([null, null, null, null, null, null, null])

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("Men")
  const [subCategory, setSubCategory] = useState("T-Shirts")
  const [type, setType] = useState("Regular Fit")
  const [bestseller, setBestseller] = useState(false)
  const [showOnBanner, setShowOnBanner] = useState(false) // ✅ NEW

  const typeOptions = {
    "T-Shirts": [
      "Regular Fit",
      "Oversized",
      "Drop Shoulder",
      "Full Sleeves",
      "Half Sleeves",
      "Collar",
      "Graphic Printed",
      "Solid"
    ],
    "Sweatshirts & Hoodies": [
      "Regular Fit",
      "Oversized",
      "Hooded",
      "Zip-Up",
      "Printed",
      "Solid"
    ],
    "Shirts": [
      "Formal Wear",
      "Party Wear",
      "Half Sleeves",
      "Full Sleeves",
      "Printed",
      "Casual Wear"
    ],
    "Jeans": [
      "Regular Fit",
      "Straight Fit",
      "Baggy",
      "Straight Baggy",
      "Mom Fit",
      "Carrot Fit",
      "Bootcut",
      "Joggers",
      "Cargo"
    ],
    "Track Pants": [
      "Regular Fit",
      "Slim Fit",
      "Baggy",
      "Joggers",
      "Athleisure"
    ]
  }

  const [sizes, setSizes] = useState([
    { size: "S", stock: 0 },
    { size: "M", stock: 0 },
    { size: "L", stock: 0 },
    { size: "XL", stock: 0 },
    { size: "XXL", stock: 0 },
  ])

  const handleImageChange = (index, file) => {
    const updated = [...images]
    updated[index] = file
    setImages(updated)
  }

  const updateStock = (size, stock) => {
    setSizes(prev =>
      prev.map(s =>
        s.size === size ? { ...s, stock: Number(stock) } : s
      )
    )
  }

  const onSubmitHandler = async () => {
    try {
      const filteredSizes = sizes.filter(s => s.stock > 0)

      if (filteredSizes.length === 0) {
        return toast.error("Add stock for at least one size")
      }

      const formData = new FormData()
      formData.append("name", name)
      formData.append("description", description)
      formData.append("price", price)
      formData.append("category", category)
      formData.append("subCategory", subCategory)
      formData.append("type", type)
      formData.append("bestseller", bestseller)
      formData.append("showOnBanner", showOnBanner) // ✅ NEW
      formData.append("sizes", JSON.stringify(filteredSizes))

      images.forEach((img, i) => {
        if (img) formData.append(`image${i + 1}`, img)
      })

      const response = await axios.post(
        `${backendUrl}/api/product/add`,
        formData,
        { headers: { token } }
      )

      if (response.data.success) {
        toast.success("Product added successfully 🎉")

        setName("")
        setDescription("")
        setPrice("")
        setCategory("Men")
        setSubCategory("T-Shirts")
        setType("Regular Fit")
        setBestseller(false)
        setShowOnBanner(false) // ✅ RESET
        setImages([null, null, null, null, null, null, null])

        setSizes([
          { size: "S", stock: 0 },
          { size: "M", stock: 0 },
          { size: "L", stock: 0 },
          { size: "XL", stock: 0 },
          { size: "XXL", stock: 0 },
        ])
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || error.message)
    }
  }

  return (
    <div className="flex flex-col gap-4">

      <div>
        <p className="mb-2">Upload Images</p>
        <div className="flex gap-3">
          {images.map((img, i) => (
            <label key={i}>
              <img
                className="w-20 cursor-pointer"
                src={img ? URL.createObjectURL(img) : assets.upload_area}
                alt=""
              />
              <input
                type="file"
                hidden
                onChange={(e) => handleImageChange(i, e.target.files[0])}
              />
            </label>
          ))}
        </div>
      </div>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="px-3 py-2 border"
        placeholder="Product name"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="px-3 py-2 border"
        placeholder="Product description"
      />

      <div className="flex gap-4 flex-wrap">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option>Men</option>
        </select>

        <select
          value={subCategory}
          onChange={(e) => {
            setSubCategory(e.target.value)
            setType(typeOptions[e.target.value][0])
          }}
        >
          {Object.keys(typeOptions).map(type => (
            <option key={type}>{type}</option>
          ))}
        </select>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {typeOptions[subCategory].map(t => (
            <option key={t}>{t}</option>
          ))}
        </select>

        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
          className="px-3 py-2 border w-28"
        />
      </div>

      <div>
        <p className="mb-2 font-medium">Size Stock</p>
        <div className="flex flex-col gap-2">
          {sizes.map(s => (
            <div key={s.size} className="flex items-center gap-3">
              <span className="w-10">{s.size}</span>
              <input
                type="number"
                min="0"
                value={s.stock}
                onChange={(e) => updateStock(s.size, e.target.value)}
                className="border px-2 py-1 w-24"
                placeholder="Stock"
              />
            </div>
          ))}
        </div>
      </div>

      <label className="flex gap-2">
        <input
          type="checkbox"
          checked={bestseller}
          onChange={() => setBestseller(prev => !prev)}
        />
        Bestseller
      </label>

      {/* ✅ NEW CHECKBOX */}
      <label className="flex gap-2">
        <input
          type="checkbox"
          checked={showOnBanner}
          onChange={() => setShowOnBanner(prev => !prev)}
        />
        Show on Homepage Banner
      </label>

      <button
        type="button"
        onClick={onSubmitHandler}
        className="bg-black text-white py-2 w-32"
      >
        ADD
      </button>
    </div>
  )
}

export default Add
