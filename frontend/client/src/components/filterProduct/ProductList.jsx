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
            className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col"
          >
            {/* Image section */}
            <div className="relative aspect-square overflow-hidden">
              <img
                alt={item?.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                src={`http://127.0.0.1:8000/storage/${
                  item?.image || item?.variants[0]?.image
                }`}
                loading="lazy"
              />

              {/* Overlay hover */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button className="absolute top-3 right-3 py-1 px-2 bg-white/80 rounded-full hover:bg-white transition-colors duration-200">
                  <i className="far fa-heart text-gray-700"></i>
                </button>
              </div>
            </div>

            {/* Text section */}
            <Link 
              to={`/shop/product-detail/${item.id}`}
              className="flex-1 p-4"
            >
              <h2 className="text-sm md:text-base font-medium text-gray-900 line-clamp-2 mb-2">
                {item?.name}
              </h2>
              
              <div className="mt-auto">
                <div className="flex items-center gap-2 min-h-[1.5rem]">
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