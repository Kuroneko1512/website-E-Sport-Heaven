import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoginAlert from "../popupmodal/LoginAlert";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/AuthSide";

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
      "https://storage.googleapis.com/a1aa/image/eeBTmdLJTouZ4E4eR7QK7AHBqkYjZXNbMmvMfkkSsjb2i8cQB.jpg",
    name: "Tailored Cotton Casual Shirt",
    price: 40,
    size: "M",
  },
];

const RightNavbar = () => {

  const [open, setOpen] = useState(false);
  const nav = useNavigate()
  const isLogin = useSelector((state) => state.auth.isLogin);
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);
  const [cartVisible, setCartVisible] = useState(false);
  const [alertLogin, setAlertLogin] = useState(false)

  const data = fakeData;

  // Sự kiện click out side
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleLogout = () => {
    dispatch(logout());
    setOpen(false);
  };

  const toggleCart = () => {
    if (!isLogin) {
      setAlertLogin(!alertLogin)
    }else{
      setCartVisible(!cartVisible);
    }
  };

  return (
    <div>
      <div className="flex items-center space-x-4">
        <i className="fas fa-search text-gray-700"></i>
        <i className="fas fa-heart text-gray-700"></i>
        <i
          className="fas fa-shopping-cart text-gray-700"
          onClick={toggleCart}
        ></i>
        {!isLogin ? (
          <Link to={"/login"} className="bg-black text-white px-4 py-2 rounded">
            Login
          </Link>
        ) : (
          <div className="relative">
            {/* Icon User */}
            <button
              onClick={() => setOpen(!open)}
              className="text-black focus:outline-none"
            >
              <i className="fas fa-user-circle text-4xl"></i>
            </button>

            {/* Dropdown Menu */}
            {open && (
              <div
                className="absolute right-0 mt-2 w-32 bg-white border border-gray-300 shadow-lg z-50"
                ref={dropdownRef}
              >
                <Link
                  to={"/profile"}
                  className="block px-3 py-1.5 bg-white text-black hover:bg-black hover:text-white"
                >
                  My Profile
                </Link>
                {/* Đăng xuất */}
                <button
                  onClick={handleLogout}
                  className="block pl-3 pr-[68px] py-1.5 bg-white text-black hover:bg-black hover:text-white"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {cartVisible && (
        <div className="fixed top-16 right-16 w-80 bg-white shadow-lg rounded-md p-4 overflow-y-scroll max-h-96 z-50">
          <h2 className="text-lg font-semibold mb-4">
            You have {data.length} items in your cart
          </h2>

          {/* Item 1 */}
          {data.map((item, index) => (
            <div className="flex items-center mb-4" key={index}>
              <img
                src={item.image}
                alt={item.name}
                className="w-12 h-16"
                width="50"
                height="70"
              />
              <div className="ml-4">
                <h3 className="text-gray-700">{item.name}</h3>
                <p className="text-gray-500">1 x ${item.price}.00</p>
                <p className="text-gray-500">Size: {item.size}</p>
              </div>
              <button className="ml-auto text-red-500">
                <i className="fas fa-trash"></i>
              </button>
            </div>
          ))}
          {/* Tổng đơn hàng */}
          <div className="border-t pt-4">
            <div className="flex justify-between mb-4">
              <span className="text-gray-700 font-medium">Subtotal</span>
              <span className="text-gray-700 font-medium">
                ${data.reduce((acc, item) => acc + item.price, 0).toFixed(2)}
              </span>
            </div>
            <Link
              to={"/cart"}
              className="w-full block text-center bg-black text-white py-2 rounded-md mb-2"
            >
              View Cart
            </Link>
            <Link
              to={"/checkout"}
              className="w-full block text-center bg-black text-white py-2 rounded-md"
            >
              Checkout
            </Link>
          </div>
        </div>
      )}
      {alertLogin && <LoginAlert />}
    </div>
  );
};

export default RightNavbar;
