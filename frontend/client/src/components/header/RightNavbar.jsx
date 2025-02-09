import React from "react";
import { Link } from "react-router-dom";

const RightNavbar = () => {
  return (
    <div>
      <div className="flex items-center space-x-4">
        <i className="fas fa-search text-gray-700"></i>
        <i className="fas fa-heart text-gray-700"></i>
        <i className="fas fa-shopping-cart text-gray-700"></i>
        <Link to={"/login"} className="bg-black text-white px-4 py-2 rounded">Login</Link>
      </div>
    </div>
  );
};

export default RightNavbar;
