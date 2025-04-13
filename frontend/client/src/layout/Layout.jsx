import { Outlet } from "react-router-dom";
import Footer from "../components/footer/Footer";
import Navbar from "../components/header/Navbar";

const Layout = () => {
  return (
    <div className="dark:bg-gray-800 min-h-screen">
      {/* Header */}
        <Navbar />

      {/* Main Page */}
      <Outlet />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
