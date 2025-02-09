import React from "react";

const Banner = () => {
  return (
    <div>
      <section className="relative mx-auto">
        {/* Fake hình ảnhảnh */}
        <img
          alt="Woman in stylish outfit"
          className="w-full h-auto"
          src="https://picsum.photos/1440/600"
        />
        {/* fake nội dungdung */}
        <div className="absolute inset-0 flex flex-col justify-center items-start p-8 md:p-16 bg-black bg-opacity-50">
          <h2 className="text-lg text-gray-200">Classic Exclusive</h2>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-2">
            Women's Collection
          </h1>
          <p className="text-lg text-gray-200 mt-2">UPTO 40% OFF</p>
          <a
            className="inline-block bg-white text-black px-6 py-3 mt-6 rounded"
            href="#"
          >
            Shop Now
            <i className="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
      </section>
    </div>
  );
};

export default Banner;
