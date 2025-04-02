import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./App.css";
import "./index.css";

import Layout from "./layout/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Notfound from "./pages/Notfound";
import Shop from "./pages/Shop";
import Blog from "./pages/Blog";
import Story from "./pages/OrderTracking";
import Contact from "./pages/Contact";
import Register from "./pages/Register";
import ProductDetail from "./pages/ProductDetail";
import Description from "./components/elementProduct/Description";
import AdditionalInformation from "./components/elementProduct/AdditionalInformation";
import Review from "./components/elementProduct/Review";

import Checkout from "./pages/Checkout";
import ShippingAddress from "./pages/ShippingAddress";
import PaymentMethod from "./pages/PaymentMethod";
import Profile from "./pages/Profile";
import InfoProfile from "./components/elementProfile/InfoProfile";
import Setting from "./components/elementProfile/Setting";
import MyOrder from "./components/elementProfile/MyOrder";
import Notification from "./components/elementProfile/Notification";
import ManageAddress from "./components/elementProfile/ManageAddress";
import PaymentCards from "./components/elementProfile/PaymentCards";
import Whishlist from "./components/elementProfile/Whishlist";
import NewCheckout from "./pages/NewCheckout";
import ReviewOrder from "./pages/ReviewOrder";
import ThankYou from "./pages/ThankYou";
import ForgotPassword from "./pages/ForgotPassword";
import OtpVerification from "./pages/OtpVerification";
import PrivateRouter from "./pages/PrivateRouter";
import BlogDetail from "./pages/BlogDetail";
import OrderTracking from "./pages/OrderTracking";
import useTokenRefresh from "./hooks/useTokenRefresh";
import GoogleAuthCallback from "./components/elementLogin/GoogleAuthCallback";


function App() {
  const location = useLocation(); // Lấy thông tin location của route hiện tại

  useTokenRefresh();
  return (
    <ThemeProvider>
      <SwitchTransition>
        <CSSTransition key={location.pathname} classNames="page" timeout={300}>
          <Routes location={location}>
            <Route path="/login" element={<Login />} />
            <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/otp-enter" element={<OtpVerification />} />
            <Route path="/" element={<Layout />}>
              <Route path="home" element={<Navigate to={"/"} />} />
              <Route index element={<Home />} />
              <Route path="shop" element={<Shop />} />

              <Route path="shop/product-detail/:id" element={<ProductDetail />}>
                <Route path="descriptions" element={<Description />} />
                <Route index element={<Description />} />
                <Route path="information" element={<AdditionalInformation />} />
                <Route path="reviews" element={<Review />} />
              </Route>


              <Route path="my-profile" element={<PrivateRouter />}>
                <Route path="" element={<Profile />}>
                  <Route index element={<InfoProfile />} />
                  <Route path="info" element={<InfoProfile />} />
                  <Route path="settings" element={<Setting />} />
                  <Route path="orders" element={<MyOrder />} />
                  <Route path="notifications" element={<Notification />} />
                  <Route path="manage-address" element={<ManageAddress />} />
                  <Route path="saved-cards" element={<PaymentCards />} />
                  <Route path="wishlists" element={<Whishlist />} />
                </Route>
              </Route>

              <Route path="blog" element={<Blog />} />
              <Route path="blog/:id" element={<BlogDetail />} />
              <Route path="transaction-history" element={<OrderTracking />} />
              <Route path="contact" element={<Contact />} />
              <Route path="*" element={<Notfound />} />
              <Route path="cart" element={<Checkout />} />
              <Route path="address" element={<ShippingAddress />} />
              <Route path="payment" element={<PaymentMethod />} />
              <Route path="newcheckout" element={<NewCheckout />} />
              <Route path="review-order" element={<ReviewOrder />} />
              <Route path="thankyou" element={<ThankYou />}></Route>
            </Route>
          </Routes>
        </CSSTransition>
      </SwitchTransition>
    </ThemeProvider>
  );
}

export default App;
