import React from "react";
import LeftNavbar from "../components/elementProfile/LeftNavbar";
import { Outlet } from "react-router-dom";

const Profile = () => {
  return (
    <div className=" dark:bg-gray-800 min-h-screen">
      <main className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-semibold mb-6 text-gray-900 dark:text-gray-200">Hồ sơ của tôi</h1>
        <div className="flex flex-col md:flex-row mb-12">
          <LeftNavbar />

          <section className="w-full md:w-3/4">
            <div className="bg-white dark:bg-gray-800 mx-10">
              <Outlet />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Profile;
