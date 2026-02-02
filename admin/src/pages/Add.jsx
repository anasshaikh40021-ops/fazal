import React, { useState } from "react"
import { assets } from "../assets/assets"
import axios from "axios"
import { backendUrl } from "../App"
import { toast } from "react-toastify"

const Add = ({ token }) => {
  const [images, setImages] = useState([null, null, null, null])

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("Men")
  const [subCategory, setSubCategory] = useState("Topwear")
  const [bestseller, setBestseller] = useState(false)
  const [sizes, setSizes] = useState([])

  const handleImageChange = (index, file) => {
    const updated = [...images]
    updated[index] = file
    setImages(updated)
  }

  const onSubmitHandler = async () => {
    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("description", description)
      formData.append("price", price)
      formData.append("category", category)
      formData.append("subCategory", subCategory)
      formData.append("bestseller", bestseller)
      formData.append("sizes", JSON.stringify(sizes))

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
        setSubCategory("Topwear")
        setBestseller(false)
        setSizes([])
        setImages([null, null, null, null])
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

      {/* Images */}
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
        required
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="px-3 py-2 border"
        placeholder="Product description"
        required
      />

      <div className="flex gap-4">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option>Men</option>
          <option>Women</option>
          <option>Kids</option>
        </select>

        <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)}>
          <option>Topwear</option>
          <option>Bottomwear</option>
          <option>Winterwear</option>
        </select>

        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
          className="px-3 py-2 border w-28"
        />
      </div>

      <div className="flex gap-3">
        {["S", "M", "L", "XL", "XXL"].map(size => (
          <p
            key={size}
            onClick={() =>
              setSizes(prev =>
                prev.includes(size)
                  ? prev.filter(s => s !== size)
                  : [...prev, size]
              )
            }
            className={`px-3 py-1 cursor-pointer ${
              sizes.includes(size) ? "bg-pink-200" : "bg-slate-200"
            }`}
          >
            {size}
          </p>
        ))}
      </div>

      <label className="flex gap-2">
        <input
          type="checkbox"
          checked={bestseller}
          onChange={() => setBestseller(prev => !prev)}
        />
        Bestseller
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
