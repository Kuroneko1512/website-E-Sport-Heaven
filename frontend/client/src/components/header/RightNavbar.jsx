import React, { useEffect, useRef, useState, useMemo } from "react"; 
import { Link } from "react-router-dom";
import LoginAlert from "../popupmodal/LoginAlert";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/AuthSide";
import classNames from "classnames";

const fakeData = [
  {
    id: 1,
    image:
      "https://storage.googleapis.com/a1aa/image/13Pj9migf8Q3ZKymjGiUn1ttXJY6OEZSx1kfXs82ejzNRecQB.jpg",
    name: "Girls Pink Moana Printed Dress",
    price: 40,
    size: "S",
  },
  {
    id: 2,
    image:
      "https://storage.googleapis.com/a1aa/image/UqHziteiUjVcVq8HX1eAD4pdgapuyI2ffJfxUQNhPLNcF55gC.jpg",
    name: "Women Textured Handheld Bag",
    price: 40,
    size: "Regular",
  },
  {
    id: 3,
    image:
      "https://storage.googleapis.com/a1aa/image/eeBTmdLJTouZ4E4E7QK7AHBqkYjZXNbMmvMfkkSsjb2i8cQB.jpg",
    name: "Tailored Cotton Casual Shirt",
    price: 40,
    size: "M",
  },
];

const RightNavbar = () => {
  const isLogin = useSelector((state) => state.auth.isLogin);
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [cartVisible, setCartVisible] = useState(false);
  const [alertLogin, setAlertLogin] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);

  const [searchText, setSearchText] = useState("");

  const userDropdownRef = useRef(null);
  const cartDropdownRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
      if (cartDropdownRef.current && !cartDropdownRef.current.contains(event.target)) {
        setCartVisible(false);
      }
      if (searchVisible && !searchRef.current.contains(event.target)) {
        setSearchVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchVisible]);

  const handleLogout = () => {
    dispatch(logout());
    setOpen(false);
  };

  const toggleCart = () => {
    if (!isLogin) {
      setAlertLogin(true);
      setTimeout(() => setAlertLogin(false), 100);
    } else {
      setCartVisible(!cartVisible);
    }
  };

  const cartTotal = useMemo(() => fakeData.reduce((acc, item) => acc + item.price, 0).toFixed(2), []);

  return (
    <div className="flex items-center space-x-4">
      {/* Search */}
      <div ref={searchRef} className="relative">
        <i 
          className="fas fa-search text-gray-700 dark:text-gray-300 cursor-pointer" 
          onClick={() => setSearchVisible(!searchVisible)} 
          aria-label="Search"
        ></i>
        <input
          type="text"
          className={classNames(
            "absolute right-10 top-[-0.5rem] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 shadow-lg rounded-md px-4 py-2 transition-all duration-300 w-64 md:w-[400px]",
            { "opacity-100 scale-100": searchVisible, "opacity-0 scale-95 hidden": !searchVisible }
          )}
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* Heart Icon */}
      <i className="fas fa-heart text-gray-700 dark:text-gray-300 cursor-pointer"></i>

      {/* Cart */}
      <div ref={cartDropdownRef}>
        <i className="fas fa-shopping-cart text-gray-700 dark:text-gray-300 cursor-pointer" onClick={toggleCart}></i>
        <div className="absolute top-[6rem] right-4 md:right-16 w-72 md:w-80 z-50 transition-transform transform ease-in-out duration-300">
          {cartVisible && (
            <div className="p-4 bg-white dark:bg-gray-800 shadow-md rounded-lg">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-200">
                You have {fakeData.length} items in your cart
              </h2>
              {fakeData.map((item, index) => (
                <div className="flex items-center mb-4" key={index}>
                  <img src={item.image} alt={item.name} className="w-12 h-16 object-cover" />
                  <div className="ml-4">
                    <h3 className="text-gray-700 dark:text-gray-300 text-sm md:text-base">{item.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">1 x ${item.price}.00</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">Size: {item.size}</p>
                  </div>
                  <button className="ml-auto text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600">
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              ))}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between mb-4">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Subtotal</span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">${cartTotal}</span>
                </div>
                <Link to="/checkout" className="w-full block text-center bg-black dark:bg-gray-700 text-white dark:text-gray-300 py-2 rounded-md">
                  View Cart
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Authentication */}
      {!isLogin ? (
        <Link to="/login" className="bg-black dark:bg-gray-700 text-white dark:text-gray-300 px-4 py-2 rounded-md">
          Login
        </Link>
      ) : (
        <div className="relative" ref={userDropdownRef}>
          <button onClick={() => setOpen(!open)} className="focus:outline-none">
            <i className="fas fa-user-circle text-2xl md:text-4xl text-gray-700 dark:text-gray-300" aria-label="User Menu"></i>
          </button>
          <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 shadow-lg rounded-lg z-50 transition-all duration-300">
            {open && (
              <>
                <Link to="/my-profile" className="block px-3 py-1.5 text-black dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700">
                  My Profile
                </Link>
                <button onClick={handleLogout} className="block w-full text-left px-3 py-1.5 text-black dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700">
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
      
      {alertLogin && <LoginAlert />}
    </div>
  );
};

export default RightNavbar;
