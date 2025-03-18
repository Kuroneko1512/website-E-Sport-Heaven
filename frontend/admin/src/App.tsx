import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Main from "@modules/main/Main";
import Login from "@modules/login/Login";
import Register from "@modules/register/Register";
import ForgetPassword from "@modules/forgot-password/ForgotPassword";
import RecoverPassword from "@modules/recover-password/RecoverPassword";
import { useWindowSize } from "@app/hooks/useWindowSize";
import { calculateWindowSize } from "@app/utils/helpers";
import { setWindowSize } from "@app/store/reducers/ui";
import ReactGA from "react-ga4";
import Attribute from '@pages/Attribute/Attribute';
import Dashboard from "@pages/Dashboard";
import Blank from "@pages/Blank";
import SubMenu from "@pages/SubMenu";
import Profile from "@pages/profile/Profile";
import Product from "@pages/Product/Product";
import PublicRoute from "./routes/PublicRoute";
import PrivateRoute from "./routes/PrivateRoute";
import { setCurrentUser } from "./store/reducers/auth";
import  Store  from "@pages/Product/Store";
import { firebaseAuth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useAppDispatch, useAppSelector } from "./store/store";
import { Loading } from "./components/Loading";
import EditComponent from '@pages/Attribute/EditComponent';
import AttributeForm from "./pages/Product/AttributeForm";
import ValueProduct from "./pages/Product/ValueProduct";

import Order from "./pages/Order/Order";
import DetailOrder from "./pages/Order/DetailOrder";
import AttributeProduct from "./pages/Product/AttributeProduct";
import VariantProduct from "./pages/Product/VariantProduct";
import Category from "./pages/Category/Category";
const { VITE_NODE_ENV } = import.meta.env;

const App = () => {
  const windowSize = useWindowSize();
  const screenSize = useAppSelector((state) => state.ui.screenSize);
  const dispatch = useAppDispatch();
  const location = useLocation();

  const [isAppLoading, setIsAppLoading] = useState(true);
  // const fakeUser = {
  //   id: '123',
  //   name: 'Ngô Thanh Cường',
  //   email: 'cuong@example.com',
  //   avatar: 'https://via.placeholder.com/150',
  //   role: 'admin',
  // };
  // useEffect(() => {
  
      
  //         dispatch(setCurrentUser(fakeUser));
      
  //         dispatch(setCurrentUser(null));
      
  //       setIsAppLoading(false);
  //     },
  //     (e) => {
  //       console.log(e);
  //       dispatch(setCurrentUser(null));
  //       setIsAppLoading(false);
  //     }
  //   );
  // }, []);
  useEffect(() => {
    const fakeUser = {
      id: '123',
      name: 'Ngô Thanh Cường',
      email: 'cuong@example.com',
      avatar: 'https://via.placeholder.com/150',
      role: 'admin',
    };
  
    setTimeout(() => {
      dispatch(setCurrentUser(fakeUser)); // Giả lập đăng nhập thành công
      setIsAppLoading(false);
    }, 1000); // Giả lập độ trễ của API
  }, []);
  useEffect(() => {
    const size = calculateWindowSize(windowSize.width);
    if (screenSize !== size) {
      dispatch(setWindowSize(size));
    }
  }, [windowSize]);

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
          <Route path="product" element={<Product />} /> 
           
    
       
          <Route path="add-product" element={<Store />} >
           <Route path="AttributeForm" element={<AttributeForm />} /> 
           <Route path="ValueProduct" element={<ValueProduct />} /> 
           <Route path="Attribute" element={<AttributeProduct />} /> 
           <Route path="Variant" element={<VariantProduct />} /> 
           <Route index element={<ValueProduct />} />
          </Route>
          {/*Route attribute*/}
          <Route path="Attribute" element={<Attribute />} />
          <Route path="Category" element={<Category />} />
         
          <Route path="Order" element={<Order />} />
          <Route path="Order/Details/:id" element={<DetailOrder />} />


          <Route path="Attribute/attribute/edit/:id"  element={<EditComponent/>} />
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
    // <>
    //   <Routes>
    //     <Route path="/login" element={<PublicRoute />}>
    //       <Route path="/login" element={<Login />} />
    //     </Route>
    //     <Route path="/register" element={<PublicRoute />}>
    //       <Route path="/register" element={<Register />} />
    //     </Route>
    //     <Route path="/forgot-password" element={<PublicRoute />}>
    //       <Route path="/forgot-password" element={<ForgetPassword />} />
    //     </Route>
    //     <Route path="/recover-password" element={<PublicRoute />}>
    //       <Route path="/recover-password" element={<RecoverPassword />} />
    //     </Route>
    //     <Route path="/" element={<PrivateRoute />}>
    //       {/* route của thanh navbar */}
    //       <Route path="/" element={<Main />}>
    //         <Route path="/sub-menu-2" element={<Blank />} />
    //         <Route path="/sub-menu-1" element={<SubMenu />} />
    //         <Route path="/blank" element={<Blank />} />
    //         <Route path="/profile" element={<Profile />} />
    //         <Route path="/product" element={<Product />} />
    //         <Route path="/" element={<Dashboard />} />

    //         {/* Route của sản phẩm  */}
    //         <Route path="/add-product" element={<Store />} />
    //       </Route>
    //     </Route>
    //   </Routes>

    //   <ToastContainer
    //     autoClose={3000}
    //     draggable={false}
    //     position="top-right"
    //     hideProgressBar={false}
    //     newestOnTop
    //     closeOnClick
    //     rtl={false}
    //     pauseOnHover
    //   />
    // </>
  );
};

export default App;
