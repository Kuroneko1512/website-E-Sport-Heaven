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
import Story from "./pages/Story";
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

function App() {
  const location = useLocation(); // Lấy thông tin location của route hiện tại

  return (
    <ThemeProvider>
      <SwitchTransition>
        <CSSTransition key={location.pathname} classNames="page" timeout={300}>
          <Routes location={location}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Layout />}>
              <Route path="home" element={<Navigate to={"/"} />} />
              <Route index element={<Home />} />
              <Route path="shop" element={<Shop />} />

              <Route path="product-detail/:id" element={<ProductDetail />}>
                <Route path="descriptions" element={<Description />} />
                <Route index element={<Description />} />
                <Route path="information" element={<AdditionalInformation />} />
                <Route path="reviews" element={<Review />} />
              </Route>

              <Route path="my-profile" element={<Profile />}>
                <Route index element={<InfoProfile />} />
                <Route path="info" element={<InfoProfile />} />
                <Route path="settings" element={<Setting />} />
                <Route path="orders" element={<MyOrder />} />
                <Route path="notifications" element={<Notification />} />
                <Route path="manage-address" element={<ManageAddress />} />
                <Route path="saved-cards" element={<PaymentCards />} />
                <Route path="wishlists" element={<Whishlist />} />
              </Route>

              <Route path="blog" element={<Blog />} />
              <Route path="story" element={<Story />} />
              <Route path="contact" element={<Contact />} />
              <Route path="*" element={<Notfound />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="address" element={<ShippingAddress />} />
              <Route path="payment" element={<PaymentMethod />} />
            </Route>
          </Routes>
        </CSSTransition>
      </SwitchTransition>
    </ThemeProvider>
  );
}

export default App;
