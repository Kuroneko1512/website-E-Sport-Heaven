import React from "react";
import Logo from "../components/header/Logo";
import Navbar from "../components/header/Navbar";
import RightNavbar from "../components/header/RightNavbar";
import Footer from "../components/footer/Footer";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div>
      {/* Header */}
      <header className="container mx-auto flex justify-between items-center px-6">
        <Logo />
        <Navbar />
        <RightNavbar />
      </header>

      {/* Main Page */}
      <Outlet />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
