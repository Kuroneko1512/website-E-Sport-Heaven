import React from "react"; 
import { Link } from "react-router-dom";
import Logo from "./Logo";
import RightNavbar from "./RightNavbar";

const Navbar = () => {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-md dark:shadow-gray-800">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 flex items-center justify-between py-4">
        {/* Logo */}
        <Link to="/">
          <Logo />
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className={`${ location.pathname === "/" ||location.pathname.includes("home")? "border-b-2 border-black" : ""} text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white`}>
            Trang chủ
          </Link>
          <Link to="/shop" className={`${location.pathname.includes("shop")? "border-b-2 border-black" : ""} text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white`}>
            Cửa hàng
          </Link>
          <Link to="/blog" className={`${location.pathname.includes("blog")? "border-b-2 border-black" : ""} text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white`}>
            Blog
          </Link>
          <Link to="/contact" className={`${location.pathname.includes("contact")? "border-b-2 border-black" : ""} text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white`}>
            Liên hệ
          </Link>
          <Link to="/transaction-history" className={`${location.pathname.includes("transaction-history")? "border-b-2 border-black" : ""} text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white`}>
            Đơn hàng giao dịch
          </Link>
        </nav>

        {/* Right Navbar */}
        <RightNavbar />
      </div>
    </header>
  );
};

export default Navbar;