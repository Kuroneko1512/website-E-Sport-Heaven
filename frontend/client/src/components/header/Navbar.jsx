import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div>
      <nav className="space-x-8 hidden md:flex">
        <Link to={"/home"} className="text-gray-600 hover:text-black">
          Home
        </Link>
        <Link to={"/shop"} className="text-gray-600 hover:text-black">
          Shop
        </Link>
        <Link to={"/story"} className="text-gray-600 hover:text-black">
          Our Story
        </Link>
        <Link to={"/blog"} className="text-gray-600 hover:text-black">
          Blog
        </Link>
        <Link to={"/contact"} className="text-gray-600 hover:text-black">
          Contact Us
        </Link>
      </nav>
    </div>
  );
};

export default Navbar;
