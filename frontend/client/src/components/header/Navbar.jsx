import React from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import RightNavbar from "./RightNavbar";

const Navbar = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 flex items-center justify-between py-4">
        {/* Logo */}
        <Link to="/">
          <Logo />
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="text-gray-700 hover:text-black">
            Home
          </Link>
          <Link to="/shop" className="text-gray-700 hover:text-black">
            Shop
          </Link>
          <Link to="/blog" className="text-gray-700 hover:text-black">
            Blog
          </Link>
          <Link to="/story" className="text-gray-700 hover:text-black">
            Story
          </Link>
          <Link to="/contact" className="text-gray-700 hover:text-black">
            Contact
          </Link>
        </nav>

        {/* Right Navbar */}
        <RightNavbar />
      </div>
    </header>
  );
};

export default Navbar;
