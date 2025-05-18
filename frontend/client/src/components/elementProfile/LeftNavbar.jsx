import Cookies from "js-cookie";
import React from "react"; 
import { Link } from "react-router-dom";

const LeftNavbar = () => {

  const user = JSON.parse(Cookies.get("user"));
  

  const menuItems = [
    { link: "info", icon: "fa-user", label: "Thông tin cá nhân" },
    { link: "password", icon: "fa-key", label: "Đổi mật khẩu" },
    { link: "orders", icon: "fa-box", label: "Đơn hàng của tôi" },
    { link: "wishlists", icon: "fa-heart", label: "Sản phâm yêu thích" },
    { link: "manage-address", icon: "fa-map-marker-alt", label: "Quản lý địa chỉ" },
    // { link: "saved-cards", icon: "fa-credit-card", label: "Thẻ đã lưu" },
    // { link: "notifications", icon: "fa-bell", label: "Thông báo" },
    { link: "settings", icon: "fa-cog", label: "Cài đặt" },
    
  ];

  return (
    <aside className="w-full md:w-1/4 md:mb-0">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
        <div className="flex items-center space-x-4 px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <img
            alt="User profile picture"
            className="h-10 w-10 rounded-full"
            height="40"
            src={user.avatar}
            width="40"
          />
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-200">Xin chào 👋</p>
            <p className="font-semibold text-gray-900 dark:text-gray-300">{user.name}</p>
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