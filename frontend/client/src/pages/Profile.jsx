import React from "react";
import LeftNavbar from "../components/elementProfile/LeftNavbar";
import { Outlet } from "react-router-dom";

const Profile = () => {
  return (
    <div>
      <main class="max-w-7xl mx-auto p-6">
        <h1 class="text-3xl font-semibold mb-6">My Profile</h1>
        <div class="flex flex-col md:flex-row mb-12">
          <LeftNavbar />

          <section class="w-full md:w-3/4">
          <div className="bg-white px-10">
            <Outlet />
          </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Profile;