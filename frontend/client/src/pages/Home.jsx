import React from "react";
import Banner from "../components/banner/Banner";
import CategorySlider from "../components/main/CategorySlider";
import ProductBestseller from "../components/main/ProductBestseller";
import CustomerSay from "../components/main/CustomerSay";
import TopFooter from "../components/footer/TopFooter";
import DealsOfTheMonth from "../components/main/DealsOfThMonth";
import { useQuery } from "@tanstack/react-query";
import instanceAxios from "../config/db";
import SkeletonLoadingHome from "../components/loadingSkeleton/SkeletonLoadingHome";
import SkeletonBestseller from "../components/loadingSkeleton/SkeletonBestseller";
import ProductLaster from "../components/main/ProductLaster";

const Home = () => {
  const { data: productData, isLoading: productLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await instanceAxios.get(`/api/v1/product/new`);
      return res?.data?.data?.data;
    },
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await instanceAxios.get(
        "api/v1/category/indexNoPagination"
      );
      return response.data?.data;
    },
  });

  const { data: productDataBestseller, isLoading: productLoadingBestseller } =
    useQuery({
      queryKey: ["productsBestseller"],
      queryFn: async () => {
        const res = await instanceAxios.get(`/api/v1/product/best-selling`);
        return res?.data?.data;
      },
    });

    const { data: productDataReview, isLoading: productLoadingReview } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      const res = await instanceAxios.get(`/api/v1/review`);
      return res?.data?.data?.data;
    },
  });

  return (
    <div className="bg-gray-50 dark:bg-gray-800 min-h-screen text-black dark:text-white">
      {/* Content */}
      <div className="container mx-auto space-y-16">
        {/* Banner */}
        <Banner />

        {/* Category Slider */}
        {categoriesLoading ? (
          <>
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">
              Danh mục sản phẩm
            </h1>
            <SkeletonLoadingHome />
          </>
        ) : (
          <CategorySlider categories={categories?.slice(0, 8)} />
        )}

        {/* Product Bestseller */}
        {productLoadingBestseller ? (
          <>
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">
              Sản phẩm bán chạy
            </h1>
            <SkeletonBestseller />
          </>
        ) : (
          <ProductBestseller productDataB={productDataBestseller} />
        )}

        {/* Product New */}
        {productLoading ? (
          <>
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">
              Sản phẩm mới
            </h1>
            <SkeletonBestseller />
          </>
        ) : (
          <ProductLaster productData={productData} />
        )}

        {/* Deals of the Month */}
        <DealsOfTheMonth />
        
        {/* Customer Say */}
        {productLoadingReview ? (
          <>
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">
              Khách hàng của chúng tôi nói gì?
            </h1>
            <SkeletonLoadingHome />
          </>
        ) : (
          <CustomerSay reviews={productDataReview?.slice(0, 8)} />
        )}
        {/* <CustomerSay /> */}
      </div>

      <TopFooter />
    </div>
  );
};

export default Home;
