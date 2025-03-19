import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { Dropdown, Menu, Badge, Input, Popover } from "antd";
import { SearchOutlined, HeartOutlined, ShoppingCartOutlined, UserOutlined } from "@ant-design/icons";
import { logout } from "../../redux/AuthSide";
import LoginAlert from "../popupmodal/LoginAlert";

const RightNavbar = () => {
  const isLogin = useSelector((state) => state.auth.isLogin, shallowEqual);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [alertLogin, setAlertLogin] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [cartVisible, setCartVisible] = useState(false);

  const searchRef = useRef(null);
  const miniCartData = useMemo(() => JSON.parse(localStorage.getItem("cartItems")) || [], []);

  // Click outside search box to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logout handler
  const handleLogout = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  // Search handler
  const handleSearch = useCallback(
    (e) => {
      if (e.key === "Enter" && searchText.trim()) {
        navigate(`/shop?search=${encodeURIComponent(searchText)}`);
        setSearchText("");
        setSearchVisible(false);
      }
    },
    [navigate, searchText]
  );

  // User menu dropdown
  const userMenu = useMemo(
    () => (
      <Menu
        items={[
          {
            key: "profile",
            label: <Link to="/my-profile">My Profile</Link>,
          },
          {
            key: "logout",
            label: <span onClick={handleLogout}>Logout</span>,
          },
        ]}
      />
    ),
    [handleLogout]
  );

  // Mini cart content
  const cartContent = useMemo(
    () => (
      <div className="w-72 max-h-80 overflow-y-auto">
        <h2 className="font-semibold mb-3">You have {miniCartData.length} items</h2>
        {miniCartData.map((item, idx) => (
          <div className="flex items-center mb-3" key={idx}>
            <img src={item.image} alt={item.name} className="w-12 h-16 object-cover mr-3" />
            <div>
              <h3 className="text-sm font-medium">{item.name}</h3>
            </div>
          </div>
        ))}
        <Link to="/checkout" className="block text-center bg-black text-white py-2 rounded mt-4">
          View Cart
        </Link>
      </div>
    ),
    [miniCartData]
  );

  return (
    <div className="flex items-center space-x-6">
      {/* Search */}
      <div ref={searchRef} className="relative">
        <SearchOutlined className="text-lg cursor-pointer" onClick={() => setSearchVisible(!searchVisible)} />
        {searchVisible && (
          <Input
            className="absolute top-0 right-0 w-64 md:w-96 shadow-lg"
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleSearch}
            autoFocus
          />
        )}
      </div>

      {/* Wishlist */}
      <HeartOutlined className="text-lg cursor-pointer" />

      {/* Cart */}
      <Popover content={cartContent} trigger="click" open={cartVisible} onOpenChange={setCartVisible} getPopupContainer={(triggerNode) => triggerNode.parentNode}>
        <Badge count={miniCartData.length} showZero>
          <ShoppingCartOutlined className="text-lg cursor-pointer" />
        </Badge>
      </Popover>

      {/* User */}
      {!isLogin ? (
        <Link to="/login" className="bg-black text-white px-4 py-2 rounded">
          Login
        </Link>
      ) : (
        <Dropdown overlay={userMenu} trigger={["hover"]} getPopupContainer={(triggerNode) => triggerNode.parentNode}>
          <UserOutlined className="text-2xl cursor-pointer" />
        </Dropdown>
      )}

      {/* Login Alert */}
      {alertLogin && <LoginAlert />}
    </div>
  );
};

export default RightNavbar;