import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Modal, Input, Drawer } from "antd";
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

  const links = [
    { to: "/", label: "Trang chủ", match: path => path === "/" || path.includes("home") },
    { to: "/shop", label: "Cửa hàng", match: path => path.includes("shop") },
    { to: "/blog", label: "Blog", match: path => path.includes("blog") },
    { to: "/contact", label: "Liên hệ", match: path => path.includes("contact") },
  ];

  const navItems = links.map(({ to, label, match }) => (
    <Link
      key={to}
      to={to}
      className={`${
        match(location.pathname) ? "border-b-2 border-black" : ""
      } text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white py-2 md:py-0 block md:inline-block`}
      onClick={() => setIsDrawerVisible(false)}
    >
      {label}
    </Link>
  ));

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md dark:shadow-gray-800">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 flex items-center justify-between py-4">
        {/* Logo */}
        <Link to="/">
          <Logo />
        </Link>

        {/* Hamburger on mobile */}
        <button onClick={toggleDrawer} className="md:hidden text-gray-700 dark:text-gray-300 focus:outline-none">
          {isDrawerVisible ? <CloseOutlined /> : <MenuOutlined />}
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:space-x-6">
          {navItems}
          <button
            onClick={showModal}
            className={`${location.pathname.includes("transaction-history") ? "border-b-2 border-black" : ""} text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white py-2 md:py-0 block md:inline-block focus:outline-none`}
          >
            Đơn hàng giao dịch
          </button>
        </nav>

        {/* Right Navbar desktop */}
        <div className="hidden md:block">
          <RightNavbar />
        </div>

        {/* Mobile Drawer */}
        <Drawer
          title={<Logo />}
          placement="left"
          onClose={toggleDrawer}
          visible={isDrawerVisible}
          bodyStyle={{ padding: '16px' }}
        >
          <nav className="flex flex-col space-y-2">
            {navItems}
            <button
              onClick={() => {
                showModal();
                toggleDrawer();
              }}
              className={`${location.pathname.includes("transaction-history") ? "border-b-2 border-black" : ""} text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white py-2 text-left w-full focus:outline-none`}
            >
              Đơn hàng giao dịch
            </button>
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