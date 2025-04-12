import React from "react";
import Banner from "../components/banner/Banner";
import CategorySlider from "../components/main/CategorySlider";
import ProductBestseller from "../components/main/ProductBestseller";
import CustomerSay from "../components/main/CustomerSay";
import TopFooter from "../components/footer/TopFooter";
import DealsOfTheMonth from "../components/main/DealsOfThMonth";
import { useQuery } from "@tanstack/react-query";
import instanceAxios from "../config/db";




const Home = () => {

  const {data: productData, isLoading: productloading} = useQuery({
    queryKey: ['products'],
    queryFn: async()=> {
      const res = await instanceAxios.get(`/api/v1/product`)
      return res?.data?.data?.data
    }
  })

  const { data: categories, isLoading: categoriesLoading } = useQuery({
      queryKey: ["categories"],
      queryFn: async () => {
        const response = await instanceAxios.get(
          "api/v1/category/indexNoPagination"
        );
        return response.data?.data;
      },
    });

  console.log("categories", categories?.slice(0, 8));
  // console.log("productData", productData);

  return (
    <div className="bg-gray-50 dark:bg-gray-800 min-h-screen text-black dark:text-white">
      {/* Content */}
      <div className="container mx-auto space-y-16">
        {/* Banner */}
        <Banner />
        <CategorySlider categories={categories?.slice(0, 8)}/>
        <ProductBestseller productData={productData}/>
        <DealsOfTheMonth />
        <CustomerSay />
      </div>

      <TopFooter />
    </div>
  );
};

export default Home;