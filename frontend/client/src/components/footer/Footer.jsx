import React from "react";
import Logo2 from "../header/Logo2";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-6 px-4 md:px-8 lg:px-16">
      <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Cột 1: Logo và thông tin liên hệ */}
        <div>
          <div className="mb-4">
            <Logo2 />
          </div>
          <p className="mb-2 text-sm text-gray-400 flex items-center">
            <i className="fas fa-phone-alt mr-2"></i>(704) 655-0127
          </p>
          <p className="mb-2 text-sm text-gray-400 flex items-center">
            <i className="fas fa-envelope mr-2"></i>sportheaven@gmail.com
          </p>
          <p className="text-sm text-gray-400 flex items-center">
            <i className="fas fa-map-marker-alt mr-2"></i>Mễ Trì, Nam Từ Liêm, TP. Hà Nội
          </p>
        </div>
        
        {/* Cột 2: Thông tin tài khoản */}
        <div>
          <h3 className="text-lg font-medium mb-4">Thông tin</h3>
          <ul className="space-y-2">
            {[
              { label: "Tài khoản của tôi", path: "/my-profile" },
              { label: "Đăng nhập", path: "/login" },
              { label: "Giỏ hàng", path: "/my-cart" },
              { label: "Sản phẩm yêu thích", path: "/my-wishlist" },
              { label: "Thanh toán", path: "/checkout" },
            ].map((item) => (
              <li key={item.path}>
                <Link className="text-sm text-gray-400 hover:text-white" to={item.path}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Cột 3: Dịch vụ */}
        <div>
          <h3 className="text-lg font-medium mb-4">Dịch vụ</h3>
          <ul className="space-y-2">
            {[
              { label: "Về chúng tôi", path: "/about" },
              { label: "Liên hệ", path: "/contact" },
              { label: "Thông tin giao hàng", path: "/delivery" },
              { label: "Chính sách bảo mật", path: "/privacy" },
              { label: "Điều khoản & Điều kiện", path: "/terms" },
            ].map((item) => (
              <li key={item.path}>
                <Link className="text-sm text-gray-400 hover:text-white" to={item.path}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Cột 4: Subscribe */}
        <div>
          <h3 className="text-lg font-medium mb-4">Đặt mua</h3>
          <p className="text-sm text-gray-400 mb-4">
          Nhập email của bạn để nhận cập nhật về các bộ sưu tập và sản phẩm mới.
          </p>
          <div className="flex w-full max-w-xs">
            <input
              className="w-full px-3 py-2 text-gray-900 rounded-l-md focus:outline-none"
              placeholder="Email của bạn"
              type="email"
            />
            <button className="bg-black text-white px-4 py-2 rounded-r-md">
              →
            </button>
          </div>
        </div>
      </div>
      
      {/* Phần dưới cùng của Footer */}
      <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-center">
        <div>
          <div className="flex space-x-4">
            <i className="fab fa-cc-visa text-2xl"></i>
            <i className="fab fa-cc-mastercard text-2xl"></i>
            <i className="fab fa-cc-amex text-2xl"></i>
            <i className="fab fa-cc-paypal text-2xl"></i>
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm mt-4 sm:mt-0">© {new Date().getFullYear()} Sport Heaven. Tất cả quyền được bảo lưu.</p>
        </div>
        <div className="flex flex-row-reverse">
          <div className="flex space-x-4 mt-4 sm:mt-0">
            {[
              { icon: "fab fa-facebook-f", link: "#" },
              { icon: "fab fa-twitter", link: "#" },
              { icon: "fab fa-instagram", link: "#" },
            ].map((social, index) => (
              <a key={index} href={social.link} className="text-gray-400 hover:text-white text-lg">
                <i className={social.icon}></i>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;