import React from "react";
import Logo2 from "../header/Logo2";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div>
      <footer className="bg-gray-900 text-white py-6">
        <div className="container mx-auto px-6 p-3">
          <div className="mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="mb-8 md:mb-0">
                {/* logo */}
                <div className=" mb-4">
                  <Logo2 />
                </div>
                {/* Thông tin địa chỉ shop */}
                <p className="mb-2 text-sm text-gray-400 hover:text-white">
                  <i className="fas fa-phone-alt mr-2"></i>
                  (704) 655-0127
                </p>
                <p className="mb-2 text-sm text-gray-400 hover:text-white">
                  <i className="fas fa-envelope mr-2"></i>
                  krist@example.com
                </p>
                <p className="mb-2 text-sm text-gray-400 hover:text-white">
                  <i className="fas fa-map-marker-alt mr-2"></i>
                  3891 Ranchview Dr. Richardson, California 62639
                </p>
              </div>

            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Information</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    className="text-sm text-gray-400 hover:text-white"
                    to={'/my-profileprofile'}
                  >
                    My Account
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-sm text-gray-400 hover:text-white"
                    to={'/login'}
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-sm text-gray-400 hover:text-white"
                    to={'/my-cart'}
                  >
                    My Cart
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-sm text-gray-400 hover:text-white"
                    to={'/my-wishlist'}
                  >
                    My Wishlist
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-sm text-gray-400 hover:text-white"
                    to={'/checkout'}
                  >
                    Checkout
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Service</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    className="text-sm text-gray-400 hover:text-white"
                    to={'/about'}
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-sm text-gray-400 hover:text-white"
                    to={'/contact'}
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-sm text-gray-400 hover:text-white"
                    to={'/delivery'}
                  >
                    Delivery Information
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-sm text-gray-400 hover:text-white"
                    to={'/privacy'}
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-sm text-gray-400 hover:text-white"
                    to={'/terms'}
                  >
                    Terms &amp; Conditions
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Subscribe</h3>
              <p className="text-sm text-gray-400 mb-4">
                Enter your email below to be the first to know about new
                collections and product launches.
              </p>
              <div className="flex">
                <input
                  className="w-full px-4 py-2 text-gray-900 rounded-l-md focus:outline-none"
                  placeholder="Your Email"
                  type="email"
                />
                <button className="bg-black text-white px-4 py-2 rounded-r-md">
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center px-6 mx-auto border-t border-gray-700 pt-4 text-center">
        <div className="flex space-x-4 mt-4">
                  <i className="fab fa-cc-visa text-2xl"></i>
                  <i className="fab fa-cc-mastercard text-2xl"></i>
                  <i className="fab fa-cc-amex text-2xl"></i>
                  <i className="fab fa-cc-paypal text-2xl"></i>
                </div>
          <p>© {new Date().getFullYear()} Sport Heaven All Rights are reserved</p>
          <div className="flex justify-center space-x-4 mt-4">
            <a href="#" className="text-gray-400 hover:text-white">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
