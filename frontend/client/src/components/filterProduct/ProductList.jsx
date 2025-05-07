import React, { useState } from "react";
import { Link } from "react-router-dom";
import FomatVND from "../../utils/FomatVND";

const ProductList = ({ products }) => {

  console.log("products", products);

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {products.map((item) => (
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
          </div>
        </Link>
        </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;