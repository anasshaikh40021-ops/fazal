import React, { useContext, useEffect, useMemo, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";

const Collection = () => {
  const { products, search } = useContext(ShopContext);

  const [showFilter, setShowFilter] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [sortType, setSortType] = useState("relevant");

  const typesData = {
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
  };

  // Toggle Category (Multi Select)
  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );
  };

  // Toggle Type
  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((item) => item !== type)
        : [...prev, type]
    );
  };

  // Filter Logic
  useEffect(() => {
    let tempProducts = [...products];

    // Only MEN category
    tempProducts = tempProducts.filter(
      (item) => item.category?.toLowerCase() === "men"
    );

    // Search
    if (search) {
      tempProducts = tempProducts.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      tempProducts = tempProducts.filter((item) =>
        selectedCategories
          .map((c) => c.toLowerCase())
          .includes(item.subCategory?.toLowerCase())
      );
    }

    // Type filter
    if (selectedTypes.length > 0) {
      tempProducts = tempProducts.filter((item) =>
        selectedTypes
          .map((t) => t.toLowerCase())
          .includes(item.type?.toLowerCase())
      );
    }

    // Sorting
    if (sortType === "low-high") {
      tempProducts.sort((a, b) => a.price - b.price);
    } else if (sortType === "high-low") {
      tempProducts.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(tempProducts);
  }, [products, search, selectedCategories, selectedTypes, sortType]);

  // Count Logic (Dynamic Count beside filters)
  const typeCounts = useMemo(() => {
    const counts = {};
    products.forEach((product) => {
      if (product.type) {
        counts[product.type] = (counts[product.type] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 pt-10 border-t">

      {/* FILTER SECTION */}
      <div className="min-w-60">
        <p
          className="my-2 text-xl flex items-center cursor-pointer gap-2"
          onClick={() => setShowFilter(!showFilter)}
        >
          FILTERS
          <img
            src={assets.dropdown_icon}
            className={`h-3 sm:hidden transition-transform ${
              showFilter ? "rotate-90" : ""
            }`}
            alt=""
          />
        </p>

        <div
          className={`border border-gray-300 pl-5 py-3 mt-6 ${
            showFilter ? "block" : "hidden"
          } sm:block`}
        >
          <p className="mb-3 text-sm font-medium">CATEGORIES</p>

          {Object.keys(typesData).map((category) => (
            <div key={category} className="mb-4">

              {/* Category (Multi Select) */}
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => toggleCategory(category)}
                />
                {category}
              </label>

              {/* Auto open when selected */}
              {selectedCategories.includes(category) && (
                <div className="flex flex-col gap-2 mt-2 ml-5 text-sm text-gray-700">
                  {typesData[category].map((type) => (
                    <label key={type} className="flex justify-between pr-3">
                      <div className="flex gap-2">
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(type)}
                          onChange={() => toggleType(type)}
                        />
                        {type}
                      </div>

                      {/* Show count */}
                      <span className="text-gray-400 text-xs">
                        ({typeCounts[type] || 0})
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}

          <button
            onClick={() => {
              setSelectedCategories([]);
              setSelectedTypes([]);
            }}
            className="mt-4 text-xs text-red-500"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {/* PRODUCT SECTION */}
      <div className="flex-1">
        <div className="flex justify-between text-base sm:text-2xl mb-4">
          <Title text1="MEN" text2="COLLECTIONS" />

          <select
            onChange={(e) => setSortType(e.target.value)}
            className="border-2 border-gray-300 text-sm px-2"
          >
            <option value="relevant">Sort by : Relevant</option>
            <option value="low-high">Sort by : Low to High</option>
            <option value="high-low">Sort by : High to Low</option>
          </select>
        </div>

        {filteredProducts.length === 0 ? (
          <p className="text-center text-gray-500">
            Products will be available soon.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
            {filteredProducts.map((item) => (
              <ProductItem
                key={item._id}
                id={item._id}
                image={item.image}
                name={item.name}
                price={item.price}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Collection;
