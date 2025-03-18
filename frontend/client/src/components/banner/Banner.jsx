import React from "react";
import anhBanner from '../../assets/banner.jpg';

const Banner = () => {
  return (
    <section className="relative mx-auto">
      <img
        alt="Women's Collection"
        className="w-full h-[400px] md:h-[500px] lg:h-[600px] object-cover"
        src={anhBanner}
        loading="lazy"
      />
      <div className="absolute inset-0 flex flex-col justify-center items-start p-6 sm:p-12 md:p-16 bg-black bg-opacity-50 dark:bg-opacity-70">
        <h2 className="text-lg text-gray-200 dark:text-gray-300">Classic Exclusive</h2>
        <h1 className="text-3xl md:text-5xl font-bold text-white dark:text-gray-100 mt-2">
          Women's Collection
        </h1>
        <p className="text-lg text-gray-200 dark:text-gray-300 mt-2">UPTO 40% OFF</p>
        <a className="inline-block bg-white dark:bg-gray-800 text-black dark:text-white px-6 py-3 mt-6 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition">
          Shop Now →
        </a>
      </div>
    </section>
  );
};

export default Banner;