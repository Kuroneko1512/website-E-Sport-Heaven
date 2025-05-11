import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Main from "@modules/main/Main";
import Login from "@modules/login/Login";
import { AuthService } from "./services/auth.service";
import Register from "@modules/register/Register";
import ForgetPassword from "@modules/forgot-password/ForgotPassword";
import RecoverPassword from "@modules/recover-password/RecoverPassword";
import { useWindowSize } from "@app/hooks/useWindowSize";
import { calculateWindowSize } from "@app/utils/helpers";
import { setWindowSize } from "@app/store/reducers/ui";
import ReactGA from "react-ga4";

import Dashboard from "@pages/Dashboard";
import Blank from "@pages/Blank";
import SubMenu from "@pages/SubMenu";
import Profile from "@pages/profile/Profile";
import Product from "@pages/Product/Product";
import PublicRoute from "./routes/PublicRoute";
import PrivateRoute from "./routes/PrivateRoute";
import Store from "@pages/Product/Store";
import { useAppDispatch, useAppSelector } from "./store/store";
import { Loading } from "./components/Loading";

import AttributeForm from "./pages/Product/AttributeForm";
import ValueProduct from "./pages/Product/ValueProduct";
import DetailProductComponent from "./pages/Product/DetailProductComponent";
import EditComponents from "./pages/Product/EditComponents";
import Order from "./pages/Order/Order";
import DetailOrder from "./pages/Order/DetailOrder";
import AttributeProduct from "./pages/Product/AttributeProduct";
import VariantProduct from "./pages/Product/VariantProduct";
import Category from "./pages/Category/Category";
import AttributePage from "@pages/Attribute/Attribute";
import { setCurrentUser, setAuthData, clearAuth } from "./store/reducers/auth";
import  Coupon  from "@pages/Coupon/Coupon";
import DetailCoupon from "@pages/Coupon/Detail";
import EditCoupon from "@pages/Coupon/Edit";
import AddCoupon from "@pages/Coupon/Store";
import OrderReturn from "./pages/OrderReurn/OrderReturn";
import DetailReturnOrder from "./pages/OrderReurn/DetailReturnOrder";


const { VITE_NODE_ENV } = import.meta.env;

const App = () => {
  const windowSize = useWindowSize();
  const screenSize = useAppSelector((state) => state.ui.screenSize);
  const dispatch = useAppDispatch();
  const location = useLocation();

  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    const access_token = localStorage.getItem("access_token");
    console.log("App init - access_token:", access_token);

    if (access_token) {
      setIsAppLoading(true);

      // Lấy thông tin user từ localStorage thay vì gọi API
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);

          // Lấy các thông tin khác từ localStorage
          const refreshToken = localStorage.getItem("refresh_token");
          const createdAt = localStorage.getItem("created_at");
          const expiresAt = localStorage.getItem("expires_at");
          const expiresIn = localStorage.getItem("expires_in");
          const permissions = localStorage.getItem("permissions");
          const roles = localStorage.getItem("roles");

          dispatch(setAuthData({
            accessToken: access_token,
            refreshToken: refreshToken,
            createdAt: createdAt,
            expiresAt: expiresAt,
            expiresIn: expiresIn ? Number(expiresIn) : null,
            permissions: permissions ? JSON.parse(permissions || '[]') : null,
            roles: roles ? JSON.parse(roles || '[]') : null,
            user: user
          }));

          console.log("Auth data restored from localStorage");
        } catch (error) {
          console.error("Error parsing user data from localStorage:", error);
          dispatch(clearAuth());
        }
      } else {
        console.error("No user data in localStorage");
        dispatch(clearAuth());
      }

      setIsAppLoading(false);
    } else {
      setIsAppLoading(false);
    }
  }, [dispatch]);


  useEffect(() => {
    const size = calculateWindowSize(windowSize.width);
    if (screenSize !== size) {
      dispatch(setWindowSize(size));
    }
  }, [windowSize.width, dispatch, screenSize]);

  useEffect(() => {
    if (location && location.pathname && VITE_NODE_ENV === "production") {
      ReactGA.send({
        hitType: "pageview",
        page: location.pathname,
      });
    }
  }, [location]);

  if (isAppLoading) {
    return <Loading />;
  }

  return (

    <>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgetPassword />} />
          <Route path="/recover-password" element={<RecoverPassword />} />
        </Route>

        {/* Private Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Main />}>
            <Route index element={<Dashboard />} />
            <Route path="sub-menu-2" element={<Blank />} />
            <Route path="sub-menu-1" element={<SubMenu />} />
            <Route path="blank" element={<Blank />} />
            <Route path="profile" element={<Profile />} />
            {/* route sản phẩm  */}
            <Route path="Product" element={<Product />} >
            </Route>
            <Route path="Product/detail/:id" element={<DetailProductComponent />} />
            <Route path="Product/edit/:id" element={<EditComponents />} />
            <Route path="add-product" element={<Store />} >
              <Route path="AttributeForm" element={<AttributeForm />} />
              <Route path="ValueProduct" element={<ValueProduct />} />
              <Route path="Attribute" element={<AttributeProduct />} />
              <Route path="Variant" element={<VariantProduct />} />
              <Route index element={<ValueProduct />} />
            </Route>
            <Route path="add-product/:id" element={<Store />} >
              <Route path="AttributeForm" element={<AttributeForm />} />
              <Route path="ValueProduct" element={<ValueProduct />} />
              <Route path="Attribute" element={<AttributeProduct />} />
              <Route path="Variant" element={<VariantProduct />} />
              <Route index element={<ValueProduct />} />
            </Route>
            {/*Route attribute*/}
            <Route path="Attribute" element={<AttributePage />} />
            <Route path="Category" element={<Category />} />

            <Route path="Order" element={<Order />} />
            <Route path="Order/Details/:id" element={<DetailOrder />} />

            <Route path="Coupon" element={<Coupon />} />
            <Route path="add-coupon" element={<AddCoupon />} />
            <Route path="edit-coupon/:id" element={<EditCoupon />} />
            <Route path="detail-coupon/:id" element={<DetailCoupon />} />
            <Route path="order-return" element={<OrderReturn />} />
            <Route path="order-return/:id" element={<DetailReturnOrder />} />
          
           
          </Route>
        </Route>
      </Routes>

      {/* Toast Notification */}
      <ToastContainer
        autoClose={3000}
        draggable={false}
        position="top-right"
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnHover
      />
    </>
  
  );
};

export default App;
