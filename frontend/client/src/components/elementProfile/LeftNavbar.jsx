import React, { useState } from "react"; 
import { Link } from "react-router-dom";

const LeftNavbar = () => {

  const menuItems = [
    { link: "info", icon: "fa-user", label: "Personal Information" },
    { link: "orders", icon: "fa-box", label: "My Orders" },
    { link: "wishlists", icon: "fa-heart", label: "My Wishlists" },
    { link: "manage-address", icon: "fa-map-marker-alt", label: "Manage Addresses" },
    { link: "saved-cards", icon: "fa-credit-card", label: "Saved Cards" },
    { link: "notifications", icon: "fa-bell", label: "Notifications" },
    { link: "settings", icon: "fa-cog", label: "Settings" }, // Mục "Settings"
  ];

  return (
    <aside className="w-full md:w-1/4 md:mb-0">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
        <div className="flex items-center space-x-4 px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <img
            alt="User profile picture"
            className="h-10 w-10 rounded-full"
            height="40"
            src="https://storage.googleapis.com/a1aa/image/FAPkl1Y91WlvvxgBiksD13hg1rq0feawzZuI2uVQLDQ.jpg"
            width="40"
          />
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-200">Hello 👋</p>
            <p className="font-semibold text-gray-900 dark:text-gray-300">Robert Fox</p>
          </div>
        </div>
        <nav>
          {menuItems.map((item, index) => (
              <Link
              key={index}
              className={`flex items-center space-x-2 px-4 py-3 
                ${location.pathname.includes(item.link) || (index === 0 && location.pathname === "/my-profile")
                  ? 'bg-black text-white dark:bg-gray-700 dark:text-gray-200' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-white hover:bg-black dark:hover:bg-gray-600'}`}
              to={`${item.link}`}
            >
              <i className={`fas ${item.icon}`} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default LeftNavbar;