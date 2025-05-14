import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Modal, Input, Button, Drawer } from "antd";
import { MenuOutlined, CloseOutlined } from '@ant-design/icons';
import Logo from "./Logo";
import RightNavbar from "./RightNavbar";

const Navbar = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [orderCodeInput, setOrderCodeInput] = useState("");
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const showModal = () => setIsModalVisible(true);
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

  const toggleDrawer = () => {
    setIsDrawerVisible(prev => !prev);
  };

  const navLinks = (
    <>
      <Link
        to="/"
        className={`${location.pathname === "/" || location.pathname.includes("home") ? "border-b-2 border-black" : ""} text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white block py-2`}
        onClick={() => setIsDrawerVisible(false)}
      >
        Trang chủ
      </Link>
      <Link
        to="/shop"
        className={`${location.pathname.includes("shop") ? "border-b-2 border-black" : ""} text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white block py-2`}
        onClick={() => setIsDrawerVisible(false)}
      >
        Cửa hàng
      </Link>
      <Link
        to="/blog"
        className={`${location.pathname.includes("blog") ? "border-b-2 border-black" : ""} text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white block py-2`}
        onClick={() => setIsDrawerVisible(false)}
      >
        Blog
      </Link>
      <Link
        to="/contact"
        className={`${location.pathname.includes("contact") ? "border-b-2 border-black" : ""} text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white block py-2`}
        onClick={() => setIsDrawerVisible(false)}
      >
        Liên hệ
      </Link>
      <button
        onClick={() => {
          showModal();
          setIsDrawerVisible(false);
        }}
        className={`text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white block py-2 w-full text-left`}
      >
        Đơn hàng giao dịch
      </button>
    </>
  );

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md dark:shadow-gray-800">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 flex items-center justify-between py-4">
        {/* Logo */}
        <Link to="/">
          <Logo />
        </Link>

        {/* Hamburger (mobile) */}
        <button
          onClick={toggleDrawer}
          className="md:hidden text-gray-700 dark:text-gray-300 focus:outline-none"
        >
          {isDrawerVisible ? <CloseOutlined /> : <MenuOutlined />}
        </button>

        {/* Navigation Links (md and up) */}
        <nav className="hidden md:flex space-x-6">
          {navLinks}
        </nav>

        {/* Right Navbar */}
        <div className="hidden md:block">
          <RightNavbar />
        </div>

        {/* Drawer for mobile navigation */}
        <Drawer
          title={<Logo />}
          placement="left"
          onClose={toggleDrawer}
          visible={isDrawerVisible}
          bodyStyle={{ padding: '0 16px' }}
        >
          <nav className="flex flex-col">
            {navLinks}
          </nav>
          <div className="mt-4">
            <RightNavbar onLinkClick={toggleDrawer} />
          </div>
        </Drawer>

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