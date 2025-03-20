import React from "react"; 
import { Link } from "react-router-dom";

const fakeData = [
  {
    id: 1,
    name: "Printed Cotton T-Shirt",
    brand: "Roadstar",
    price: 38,
    oldPrice: 50,
    image:
      "https://storage.googleapis.com/a1aa/image/MSTn7yA3fyZFHAGlWXBk7nhwiz0apOyrlCgC-ufECbM.jpg",
  },
  {
    id: 2,
    name: "Printed Cotton T-Shirt",
    brand: "Roadstar",
    price: 38,
    oldPrice: 50,
    image:
      "https://storage.googleapis.com/a1aa/image/MSTn7yA3fyZFHAGlWXBk7nhwiz0apOyrlCgC-ufECbM.jpg",
  },
  {
    id: 3,
    name: "Printed Cotton T-Shirt",
    brand: "Roadstar",
    price: 38,
    oldPrice: 50,
    image:
      "https://storage.googleapis.com/a1aa/image/MSTn7yA3fyZFHAGlWXBk7nhwiz0apOyrlCgC-ufECbM.jpg",
  },
  {
    id: 4,
    name: "Printed Cotton T-Shirt",
    brand: "Roadstar",
    price: 38,
    oldPrice: 50,
    image:
      "https://storage.googleapis.com/a1aa/image/MSTn7yA3fyZFHAGlWXBk7nhwiz0apOyrlCgC-ufECbM.jpg",
  },
];

const ProductBestseller = () => {
  return (
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-gray-100">
        Sản phẩm chạy nhất
      </h2>

      {/* Grid responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {fakeData.map((item) => (
          <div
            key={item.id}
            className="group bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-700 rounded-lg overflow-hidden hover:shadow-xl duration-300 transition-transform transform hover:scale-105"
          >
            {/* Image section */}
            <div className="relative h-2/3 xl:h-3/4">
              <img
                alt={item.name}
                className="w-full h-full object-cover"
                src={item.image}
              />

              {/* Overlay hover */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <i className="far fa-heart absolute text-black dark:text-gray-300 top-5 right-5 border rounded-full border-[#D9D9D9] dark:border-gray-600 p-3 bg-[#D9D9D9] dark:bg-gray-700 hover:bg-white dark:hover:bg-gray-500"> </i>
                <button className="bg-black dark:bg-gray-700 text-white dark:text-gray-300 py-2 px-4 rounded-lg mt-auto w-5/6 hover:bg-gray-800 dark:hover:bg-gray-600">
                  Thêm vào giỏ hàng
                </button>
              </div>
            </div>

            {/* Text section */}
            <Link to={`/product-detail/${item.id}`}>
              <div className="p-4">
                <h2 className="text-lg sm:text-base md:text-xl font-bold text-gray-900 dark:text-gray-100">
                  {item.brand}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">{item.name}</p>
                <div className="flex items-center mt-2">
                  <span className="text-lg font-bold text-black dark:text-gray-200">
                    ${item.price}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500 line-through ml-2">
                    ${item.oldPrice}
                  </span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductBestseller;