import React from "react";
import Banner from "../components/banner/Banner";

const Home = () => {
  return (
    <div>
      {/* Banner */}
      <Banner />
      {/* Content */}
      <div className="ontainer mx-auto px-6 p-3">Content</div>
    </div>
  );
};

export default Home;
