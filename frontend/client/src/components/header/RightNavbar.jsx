import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { Dropdown, Menu, Badge, Input, Popover, Modal } from "antd";
import {
  SearchOutlined,
  HeartOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { logout } from "../../redux/AuthSide";
import LoginAlert from "../popupmodal/LoginAlert";
import Cookies from "js-cookie";

const RightNavbar = () => {
  const isLogin = useSelector((state) => state.auth.isLogin, shallowEqual);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [alertLogin, setAlertLogin] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [cartVisible, setCartVisible] = useState(false);
  const isDark = document.documentElement.classList.contains("dark");

  const searchRef = useRef(null);
  const [miniCartData, setMiniCartData] = useState(
    JSON.parse(localStorage.getItem("cartItems")) || []
  );

  const user = useSelector((state) => state.auth.user, shallowEqual);
  const [nameU, setNameU] = useState(null);

  useEffect(() => {
    if (!isLogin) {
      setNameU(null);
      return;
    }
    
    // First try to get from Redux store
    if (user && user.name) {
      setNameU({ user });
      return;
    }

    // Fallback to cookies if Redux state not available
    try {
      const userRaw = Cookies.get("user");
      if (!userRaw || userRaw === "undefined") {
        setNameU(null);
        return;
      }
      const cookieUser = JSON.parse(userRaw);
      if (cookieUser && typeof cookieUser === "object") {
        setNameU({ user: cookieUser });
      } else {
        setNameU(null);
      }
    } catch (err) {
      console.warn("Invalid user cookie:", err);
      setNameU(null);
    }
  }, [isLogin, user]);

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

  //Auto cập nhật giỏ hàng ngay lập tức.
  useEffect(() => {
    const handleStorageChange = () => {
      setMiniCartData(JSON.parse(localStorage.getItem("cartItems")) || []);
    };

    const handleCartUpdated = (e) => {
      // Use event detail if available, otherwise fallback to localStorage
      if (e.detail) {
        setMiniCartData(e.detail);
      } else {
        handleStorageChange();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cartUpdated", handleCartUpdated);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", handleCartUpdated);
    };
  }, []);

  const updateCart = (newCart) => {
    localStorage.setItem("cartItems", JSON.stringify(newCart));
    setMiniCartData(newCart);
    // Dispatch event with the updated cart data
    window.dispatchEvent(new CustomEvent("cartUpdated", { 
      detail: newCart 
    }));
  };

  const removeFromCart = (id, vid) => {
    Modal.confirm({
      title: "Xác nhận xóa sản phẩm",
      content: "Bạn có chắc muốn xóa sản phẩm này?",
      onOk: () => {
        const newCart = miniCartData.filter(
          (item) => item.product_id !== id || (vid && item.variant_id !== vid)
        );
        updateCart(newCart);
        window.dispatchEvent(new CustomEvent("cartUpdated", { detail: newCart })); // Phát sự kiện để đồng bộ
      },
    });
  };

  // Logout handler
  const handleLogout = useCallback(() => {
    // Clear user cookie on logout
    Cookies.remove("user");
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
        className="dark:bg-gray-800 dark:text-white"
        items={[
          {
            key: "profile",
            label: (
              <Link to="/my-profile" className="dark:!text-white">
                Hồ sơ
              </Link>
            ),
          },
          {
            key: "logout",
            label: (
              <span onClick={handleLogout} className="dark:!text-white">
                Đăng xuất
              </span>
            ),
          },
        ]}
      />
    ),
    [handleLogout]
  );

  // Mini cart content
  const cartContent = (
    <div className="w-72 bg-white dark:bg-gray-800 dark:text-white">
      <div className=" overflow-y-auto max-h-80">
      <h2 className="font-semibold mb-3">
        Bạn có {miniCartData.length} sản phẩm
      </h2>
      {miniCartData.map((item, idx) => (
        <div className="flex items-center mb-3" key={idx}>
          <div className="flex items-center">
            <img
              src={`http://127.0.0.1:8000/storage/${item.image}`}
              alt={item.name}
              className="w-12 h-16 object-cover mr-3"
            />
            <h3 className="text-sm font-medium">{item.name}</h3>
          </div>
          <i
            className="text-red-500 cursor-pointer ml-auto"
            onClick={() => removeFromCart(item.product_id, item.variant_id)}
          >
            <DeleteOutlined />
          </i>
        </div>
      ))}
      </div>
      <Link
        to="/cart"
        className="block text-center bg-black text-white dark:bg-blue-600 dark:text-white py-2 rounded mt-4"
      >
        Xem giỏ hàng
      </Link>
    </div>
  );

  return (
    <div className="flex items-center space-x-6">
      {/* Search */}
      <div ref={searchRef} className="relative">
        <SearchOutlined
          className="text-lg cursor-pointer dark:text-white"
          onClick={() => setSearchVisible(!searchVisible)}
        />
        {searchVisible && (
          <Input
            className="absolute top-0 right-0 w-64 md:w-96 shadow-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            placeholder="Tìm kiếm..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleSearch}
            autoFocus
          />
        )}
      </div>

      {/* Wishlist */}
      <Link to="/my-profile/wishlists"><HeartOutlined className="text-lg cursor-pointer dark:text-white" /></Link>

      {/* Cart */}
      <Popover
        content={cartContent}
        trigger={["click"]}
        open={cartVisible}
        onOpenChange={setCartVisible}
        getPopupContainer={(triggerNode) => triggerNode.parentNode}
        overlayInnerStyle={
          isDark ? { backgroundColor: "#1f2937", color: "#fff" } : {}
        }
      >
        <Badge count={miniCartData.length} showZero>
          <ShoppingCartOutlined className="text-lg cursor-pointer dark:text-white" />
        </Badge>
      </Popover>

      {/* User */}
      {!isLogin ? (
        <Link
          to="/login"
          className="bg-black text-white dark:bg-blue-600 dark:text-white px-4 py-2 rounded"
        >
          Đăng nhập
        </Link>
      ) : (
        <Dropdown
          overlay={userMenu}
          trigger={["click"]}
          getPopupContainer={(triggerNode) => triggerNode.parentNode}
          overlayClassName="dark:bg-gray-800 dark:text-white"
        >
          <div className="flex items-center gap-2">
            <UserOutlined className="text-2xl cursor-pointer dark:text-white" />
            <span>
              {nameU?.user?.name 
                ? nameU?.user.name.length > 10 
                  ? `${nameU?.user.name.substring(0, 8)}...`
                  : nameU?.user.name
                : ''}
            </span>
          </div>
        </Dropdown>
      )}

      {/* Login Alert */}
      {alertLogin && <LoginAlert />}
    </div>
  );
};

export default RightNavbar;
