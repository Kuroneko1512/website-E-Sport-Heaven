import React, { useEffect, useRef, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const [open, setOpen] = useState(false);
  const [cartVisible, setCartVisible] = useState(false);
  const [alertLogin, setAlertLogin] = useState(false);
  const nav = useNavigate();
  const isLogin = useSelector((state) => state.auth.isLogin);
  const dispatch = useDispatch();
  const userDropdownRef = useRef(null);
  const cartDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
      if (cartDropdownRef.current && !cartDropdownRef.current.contains(event.target)) {
        setCartVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
      <i className="fas fa-search text-gray-700 cursor-pointer"></i>
      <i className="fas fa-heart text-gray-700 cursor-pointer"></i>
      <div ref={cartDropdownRef}>
        <i className="fas fa-shopping-cart text-gray-700 cursor-pointer" onClick={toggleCart}></i>
        <div className="absolute top-16 right-4 md:right-16 w-72 md:w-80 p-4 bg-white z-50 transition-transform transform ease-in-out duration-300">
          {cartVisible && (
            <>
              <h2 className="text-lg font-semibold mb-4">You have {fakeData.length} items in your cart</h2>
              {fakeData.map((item, index) => (
                <div className="flex items-center mb-4" key={index}>
                  <img src={item.image} alt={item.name} className="w-12 h-16 object-cover" />
                  <div className="ml-4">
                    <h3 className="text-gray-700 text-sm md:text-base">{item.name}</h3>
                    <p className="text-gray-500 text-xs md:text-sm">1 x ${item.price}.00</p>
                    <p className="text-gray-500 text-xs md:text-sm">Size: {item.size}</p>
                  </div>
                  <button className="ml-auto text-red-500 hover:text-red-700">
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between mb-4">
                  <span className="text-gray-700 font-medium">Subtotal</span>
                  <span className="text-gray-700 font-medium">${cartTotal}</span>
                </div>
                <Link to="/cart" className="w-full block text-center bg-black text-white py-2 rounded-md mb-2">View Cart</Link>
                <Link to="/checkout" className="w-full block text-center bg-black text-white py-2 rounded-md">Checkout</Link>
              </div>
            </>
          )}
        </div>
      </div>
      {!isLogin ? (
        <Link to="/login" className="bg-black text-white px-4 py-2 rounded-md">Login</Link>
      ) : (
        <div className="relative" ref={userDropdownRef}>
          <button onClick={() => setOpen(!open)} className="focus:outline-none">
            <i className="fas fa-user-circle text-2xl md:text-4xl" aria-label="User Menu"></i>
          </button>
          <div className={classNames("absolute right-0 mt-2 w-32 bg-white border border-gray-300 shadow-lg z-50 transition-all duration-300", { "opacity-100 translate-y-0 scale-100": open, "opacity-0 translate-y-[-10px] scale-95": !open })}>
            {open && (
              <>
                <Link to="/profile" className="block px-3 py-1.5 text-black hover:bg-gray-200">My Profile</Link>
                <button onClick={handleLogout} className="block w-full text-left px-3 py-1.5 text-black hover:bg-gray-200">Logout</button>
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
