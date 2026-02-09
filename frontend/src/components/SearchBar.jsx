import React, { useContext, useEffect, useRef, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";

const RECENT_KEY = "recent_searches";

const SearchBar = () => {
  const {
    showSearch,
    setShowSearch,
    search,
    setSearch,
    products,
    navigate,
    currency,
  } = useContext(ShopContext);

  const inputRef = useRef(null);
  const [recent, setRecent] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  /* ---------------- LOAD RECENT ---------------- */
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
    setRecent(saved);
  }, []);

  /* ---------------- AUTO FOCUS ---------------- */
  useEffect(() => {
    if (showSearch) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [showSearch]);

  /* ---------------- SIMILAR SEARCH LOGIC ---------------- */
  const getSimilarProducts = (query) => {
    const keywords = query.toLowerCase().split(" ");

    return products
      .map((product) => {
        const name = product.name.toLowerCase();
        let score = 0;

        keywords.forEach((word) => {
          if (name.includes(word)) score += 3;
          if (name.startsWith(word)) score += 5;
        });

        // typo tolerance
        if (
          name.replace(/\s/g, "").includes(
            query.toLowerCase().replace(/\s/g, "")
          )
        ) {
          score += 2;
        }

        return { product, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((item) => item.product);
  };

  /* ---------------- UPDATE SUGGESTIONS ---------------- */
  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([]);
      return;
    }

    const result = getSimilarProducts(search);
    setSuggestions(result);
  }, [search, products]);

  /* ---------------- SAVE RECENT ---------------- */
  const saveSearch = (value) => {
    if (!value.trim()) return;

    const updated = [
      value,
      ...recent.filter((item) => item !== value),
    ].slice(0, 5);

    setRecent(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  /* ---------------- ENTER KEY ---------------- */
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && search.trim()) {
      saveSearch(search);
      setShowSearch(false);
      navigate(`/collection?search=${search}`);
    }
  };

  if (!showSearch) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      {/* PANEL */}
      <div className="absolute top-0 left-0 right-0 bg-white p-4 rounded-b-2xl animate-slideDown">
        {/* INPUT */}
        <div className="flex items-center gap-3 mb-3">
          <img src={assets.search_icon} className="w-5" alt="search" />

          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search products..."
            className="flex-1 text-base border-none outline-none"
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-gray-500 text-xl px-2"
            >
              ×
            </button>
          )}

          <img
            onClick={() => {
              setShowSearch(false);
              setSearch("");
            }}
            src={assets.cross_icon}
            className="w-4 cursor-pointer"
            alt="close"
          />
        </div>

        {/* 🔍 SUGGESTIONS */}
        {suggestions.length > 0 && (
          <div className="max-h-64 overflow-y-auto">
            {suggestions.map((item) => (
              <div
                key={item._id}
                onClick={() => {
                  saveSearch(item.name);
                  setShowSearch(false);
                  setSearch("");
                  navigate(`/product/${item._id}`);
                }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <img
                  src={item.image[0]}
                  className="w-12 h-12 object-cover rounded"
                  alt={item.name}
                />
                <div className="flex flex-col">
                  <p className="text-sm font-medium truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {currency}
                    {item.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 🕘 RECENT SEARCHES */}
        {!search && recent.length > 0 && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-gray-500">Recent searches</p>
              <button
                onClick={() => {
                  setRecent([]);
                  localStorage.removeItem(RECENT_KEY);
                }}
                className="text-xs text-red-500"
              >
                Clear
              </button>
            </div>

            {recent.map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  setSearch(item);
                  setShowSearch(false);
                  navigate(`/collection?search=${item}`);
                }}
                className="block w-full text-left px-3 py-2 bg-gray-100 rounded mb-2 text-sm truncate"
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
