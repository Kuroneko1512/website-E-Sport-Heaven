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
          <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white">
            Trang chủ
          </Link>
          <Link to="/shop" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white">
            Cửa hàng
          </Link>
          <Link to="/blog" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white">
            Blog
          </Link>
          <Link to="/story" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white">
            Tiểu sử
          </Link>
          <Link to="/contact" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white">
            Liên hệ
          </Link>
        </nav>

        {/* Right Navbar */}
        <RightNavbar />
      </div>
    </header>
  );
};

export default Navbar;
