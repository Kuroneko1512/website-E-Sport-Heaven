import React from "react";
import Banner from "../components/banner/Banner";
import CategorySlider from "../components/main/CategorySlider";
import ProductBestseller from "../components/main/ProductBestseller";
import CustomerSay from "../components/main/CustomerSay";
import TopFooter from "../components/footer/TopFooter";
import DealsOfTheMonth from "../components/main/DealsOfThMonth";

const Home = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 min-h-screen text-black dark:text-white">
      <div className="container mx-auto space-y-16">
        {/* Banner */}
        <Banner />
        {/* Content */}
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
