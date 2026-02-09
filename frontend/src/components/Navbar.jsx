import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);
  const location = useLocation();

  const {
    setShowSearch,
    getCartCount,
    navigate,
    token,
    user,
    logout,
  } = useContext(ShopContext);

  /* ---------------- CLOSE PROFILE ON OUTSIDE CLICK ---------------- */
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  /* ---------------- CLOSE MENUS ON ROUTE CHANGE ---------------- */
  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const profileImage =
    user?.profileImage
      ? `${import.meta.env.VITE_BACKEND_URL}/${user.profileImage}`
      : assets.profile_icon;

  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="flex items-center justify-between px-4 py-4 max-w-7xl mx-auto">
        {/* LOGO */}
        <Link to="/">
          <img src={assets.logo} alt="logo" className="w-32 sm:w-36" />
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden sm:flex gap-6 text-sm text-gray-700">
          <NavLink to="/">HOME</NavLink>
          <NavLink to="/collection">COLLECTION</NavLink>
          <NavLink to="/about">ABOUT</NavLink>
          <NavLink to="/contact">CONTACT</NavLink>
        </nav>

        {/* RIGHT ICONS */}
        <div className="flex items-center gap-5">
          {/* SEARCH */}
          <button onClick={() => setShowSearch(true)}>
            <img src={assets.search_icon} alt="search" className="w-5" />
          </button>

          {/* PROFILE */}
          <div className="relative" ref={profileRef}>
            <img
              src={profileImage}
              alt="profile"
              className="w-8 h-8 rounded-full object-cover cursor-pointer"
              onClick={() => {
                if (!token) navigate("/login");
                else setProfileOpen((prev) => !prev);
              }}
            />

            {token && profileOpen && (
              <div className="absolute right-0 mt-3 w-44 bg-white shadow-lg rounded-md text-sm z-50 overflow-hidden">
                <button
                  onClick={() => navigate("/profile")}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100"
                >
                  My Profile
                </button>

                <button
                  onClick={() => navigate("/orders")}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100"
                >
                  Orders
                </button>

                <button
                  onClick={logout}
                  className="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* CART */}
          <Link to="/cart" className="relative">
            <img src={assets.cart_icon} alt="cart" className="w-5" />
            {getCartCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                {getCartCount()}
              </span>
            )}
          </Link>

          {/* MOBILE MENU BUTTON */}
          <button className="sm:hidden" onClick={() => setMenuOpen(true)}>
            <img src={assets.menu_icon} alt="menu" className="w-5" />
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`fixed inset-0 bg-black/40 z-50 transition ${
          menuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setMenuOpen(false)}
      >
        <div
          className={`absolute right-0 top-0 h-full w-3/4 bg-white transform transition-transform ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b font-medium">Menu</div>

          <nav className="flex flex-col">
            <NavLink to="/" className="px-6 py-3 border-b">
              Home
            </NavLink>
            <NavLink to="/collection" className="px-6 py-3 border-b">
              Collection
            </NavLink>
            <NavLink to="/about" className="px-6 py-3 border-b">
              About
            </NavLink>
            <NavLink to="/contact" className="px-6 py-3 border-b">
              Contact
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
