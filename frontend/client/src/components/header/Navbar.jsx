import React, { useState } from "react"; 
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from "./Logo";
import RightNavbar from "./RightNavbar";
import { Modal, Input, Button } from "antd";

const Navbar = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [orderCodeInput, setOrderCodeInput] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    if (orderCodeInput.trim()) {
      setIsModalVisible(false);
      navigate(`/order-history/${orderCodeInput.trim()}`);
      setOrderCodeInput("");
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setOrderCodeInput("");
  };

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
          <button
            onClick={showModal}
            className={`${location.pathname.includes("transaction-history") ? "border-b-2 border-black" : ""} text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white focus:outline-none`}
          >
            Đơn hàng giao dịch
          </button>
        </nav>

        {/* Right Navbar */}
        <RightNavbar />

        {/* Modal for order code input */}
        <Modal
          title="Nhập mã đơn hàng"
          visible={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          okText="Tìm kiếm"
          cancelText="Hủy"
          okButtonProps={{ disabled: !orderCodeInput.trim() }}
        >
          <Input
            placeholder="Nhập mã đơn hàng..."
            value={orderCodeInput}
            onChange={(e) => setOrderCodeInput(e.target.value)}
            onPressEnter={handleOk}
            autoFocus
          />
        </Modal>
      </div>
    </header>
  );
};

export default Navbar;
