import React, { useState } from "react";
import { Link } from "react-router-dom";

// Tạo component cho mỗi mục menu
const NavItem = ({ link,icon, label, isActive, onClick }) => (
  <Link
    className={`flex items-center space-x-2 px-4 py-3 ${isActive ? 'bg-black text-white' : 'text-gray-600 hover:text-white hover:bg-black'}`}
    to={`${link}`}
    onClick={onClick}
  >
    <i className={`fas ${icon}`} />
    <span>{label}</span>
  </Link>
);

const LeftNavbar = () => {
  const [activeMenu, setActiveMenu] = useState("info"); // Mặc định mục "Settings" được chọn

  const menuItems = [
    { link: "info", icon: "fa-user", label: "Personal Information" },
    { link: "orders", icon: "fa-box", label: "My Orders" },
    { link: "wishlists", icon: "fa-heart", label: "My Wishlists" },
    { link: "manage-address", icon: "fa-map-marker-alt", label: "Manage Addresses" },
    { link: "saved-cards", icon: "fa-credit-card", label: "Saved Cards" },
    { link: "notifications", icon: "fa-bell", label: "Notifications" },
    { link: "settings", icon: "fa-cog", label: "Settings" }, // Mục "Settings"
  ];

  // Hàm xử lý sự kiện khi người dùng chọn một mục
  const handleMenuClick = (link) => {
    setActiveMenu(link); // Cập nhật trạng thái active khi người dùng nhấn vào menu
  };

  return (
    <aside className="w-full md:w-1/4 md:mb-0">
      <div className="bg-white border border-gray-200">
        <div className="flex items-center space-x-4 px-4 py-4 border-b border-gray-200">
          <img
            alt="User profile picture"
            className="h-10 w-10 rounded-full"
            height="40"
            src="https://storage.googleapis.com/a1aa/image/FAPkl1Y91WlvvxgBiksD13hg1rq0feawzZuI2uVQLDQ.jpg"
            width="40"
          />
          <div>
            <p className="font-semibold">Hello 👋</p>
            <p className="font-semibold">Robert Fox</p>
          </div>
        </div>
        <nav>
          {menuItems.map((item, index) => (
              <NavItem
                icon={item.icon}
                label={item.label}
                key={index}
                link={item.link}
                isActive={activeMenu === item.link} // Kiểm tra nếu item này là mục đang active
                onClick={() => handleMenuClick(item.link)} // Cập nhật active khi click
              />
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default LeftNavbar;