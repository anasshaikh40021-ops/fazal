import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);

  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState('relavent');

  /* ---------------- TOGGLE FILTERS ---------------- */

  const toggleCategory = (e) => {
    const value = e.target.value;
    setCategory((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const toggleSubCategory = (e) => {
    const value = e.target.value;
    setSubCategory((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  /* ---------------- FILTER + SORT ---------------- */

  useEffect(() => {
    let tempProducts = [...products];

    // Search filter
    if (showSearch && search) {
      tempProducts = tempProducts.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Category filter
    if (category.length > 0) {
      tempProducts = tempProducts.filter((item) =>
        category.includes(item.category)
      );
    }

    // Sub-category filter
    if (subCategory.length > 0) {
      tempProducts = tempProducts.filter((item) =>
        subCategory.includes(item.subCategory)
      );
    }

    // Sorting
    if (sortType === 'low-high') {
      tempProducts.sort((a, b) => a.price - b.price);
    } else if (sortType === 'high-low') {
      tempProducts.sort((a, b) => b.price - a.price);
    }

    setFilterProducts(tempProducts);
  }, [products, category, subCategory, sortType, search, showSearch]);

  /* ---------------- UI ---------------- */

  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 pt-10 border-t">

      {/* FILTER SIDEBAR */}
      <div className="min-w-60">
        <p
          className="my-2 text-xl flex items-center cursor-pointer gap-2"
          onClick={() => setShowFilter(!showFilter)}
        >
          FILTERS
          <img
            src={assets.dropdown_icon}
            className={`h-3 sm:hidden transition-transform ${
              showFilter ? 'rotate-90' : ''
            }`}
            alt=""
          />
        </p>

        <div
          className={`border border-gray-300 pl-5 py-3 mt-6
          ${showFilter ? 'block' : 'hidden'} sm:block`}
        >
          {/* CATEGORIES */}
          <p className="mb-3 text-sm font-medium">CATEGORIES</p>
          <div className="flex flex-col gap-2 text-sm text-gray-700">
            {['Men', 'Women', 'Kids'].map((item) => (
              <label key={item} className="flex gap-2">
                <input
                  type="checkbox"
                  value={item}
                  onChange={toggleCategory}
                />
                {item}
              </label>
            ))}
          </div>

          {/* TYPE */}
          <p className="mb-3 mt-6 text-sm font-medium">TYPE</p>
          <div className="flex flex-col gap-2 text-sm text-gray-700">
            {['Topwear', 'Bottomwear', 'Winterwear'].map((item) => (
              <label key={item} className="flex gap-2">
                <input
                  type="checkbox"
                  value={item}
                  onChange={toggleSubCategory}
                />
                {item}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* PRODUCTS */}
      <div className="flex-1">
        <div className="flex justify-between text-base sm:text-2xl mb-4">
          <Title text1="ALL" text2="COLLECTIONS" />

          <select
            onChange={(e) => setSortType(e.target.value)}
            className="border-2 border-gray-300 text-sm px-2"
          >
            <option value="relavent">Sort by : Relevant</option>
            <option value="low-high">Sort by : Low to High</option>
            <option value="high-low">Sort by : High to Low</option>
          </select>
        </div>

        {filterProducts.length === 0 ? (
          <p className="text-center text-gray-500">
            No products found
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
            {filterProducts.map((item) => (
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
