import React from "react";
import { Link } from "react-router-dom";
import FomatVND from "../../utils/FomatVND";

const ProductList = ({ products }) => {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
        {products?.data?.map((item) => (
          <div
          key={item.id}
          className="group bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl duration-300 transition-transform transform hover:scale-105 h-[34rem]"
        >
          {/* Image section */}
          <div className="relative h-3/4">
            <img
              alt={item.name}
              className="w-full h-full object-cover"
              src={`http://127.0.0.1:8000/storage/${item.image || item.variants[0]?.image}`}
            />
            
            {/* Overlay hover */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <i className="far fa-heart absolute text-black top-5 right-5 border rounded-full border-[#D9D9D9] p-3 bg-[#D9D9D9] hover:bg-white"> </i>
            </div>
          </div>

          {/* Text section */}
        <Link to={`/shop/product-detail/${item.id}`}>
          <div className="p-4">
            <h2 className="text-lg font-bold">{item.name}</h2>
            {/* <p className="text-gray-600">{item.name}</p> */}
            <div className="flex items-center mt-2">
              <span className="text-lg font-bold text-black">
                {FomatVND((item.price - item.price * 0.1) || item.variants[0]?.price - item.variants[0]?.price * 0.1)}
              </span>
              <span className="text-gray-400 line-through ml-2">
                {FomatVND(item.price || item.variants[0]?.price)}
              </span>
            </div>

            {/* Text section */}
            <Link 
              to={`/shop/product-detail/${item.id}`}
              className="flex-1 p-4"
            >
              <h2 className="text-sm md:text-xl text-center font-medium text-gray-900 line-clamp-2 mb-2">
                {item?.name}
              </h2>
              
              <div className="mt-auto">
                <div className="flex items-center justify-center gap-2 min-h-[1.5rem]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base md:text-lg font-bold text-gray-900">
                      {FomatVND(
                        item.price - (item.price * item.discount_percent) / 100 ||
                          item.variants[0].price -
                            (item.variants[0].price *
                              item.variants[0].discount_percent) /
                              100
                      )}
                    </span>
                    {item.discount_percent > 0 && (
                      <>
                        <span className="text-xs md:text-sm text-gray-500 line-through">
                          {FomatVND(item.price || item.variants[0].price)}
                        </span>
                        <span className="text-xs font-medium text-white bg-red-500 rounded px-1.5 py-0.5">
                          -{parseFloat(item.discount_percent)}%
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;