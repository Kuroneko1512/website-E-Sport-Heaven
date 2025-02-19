import React from "react";
import Banner from "../components/banner/Banner";
import CategorySlider from "../components/main/CategorySlider";
import ProductBestseller from "../components/main/ProductBestseller";
import DealsOfTheMonth from "../components/main/DealsOfThMonth";
import CustomerSay from "../components/main/CustomerSay";
import TopFooter from "../components/footer/TopFooter";

const Home = () => {
  return (
    <div>
      {/* Banner */}
      <Banner />

      {/* Content */}
      <div className="ontainer mx-auto px-6 p-3">
        <CategorySlider />
        <ProductBestseller />
        <DealsOfTheMonth />
        <CustomerSay />
      </div>

      <TopFooter />
    </div>
  );
};

export default Home;
