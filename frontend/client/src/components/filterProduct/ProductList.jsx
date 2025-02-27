import React, { useState } from "react";
import { Link } from "react-router-dom";

const ProductList = ({ products }) => {
  const itemsPerPage = 12; // Số sản phẩm mỗi trang
  const [currentPage, setCurrentPage] = useState(1);

  // Tính toán tổng số trang
  const totalPages = Math.ceil(products.length / itemsPerPage);

  // Xác định phạm vi sản phẩm hiển thị
  const startIndex = (currentPage - 1) * itemsPerPage;
  const selectedProducts = products.slice(startIndex, startIndex + itemsPerPage);
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {selectedProducts.map((item) => (
          <div
          key={item.id}
          className="group bg-white shadow-md h-auto rounded-lg overflow-hidden hover:shadow-xl duration-300 transition-transform transform hover:scale-105"
        >
          {/* Image section */}
          <div className="relative h-3/4">
            <img
              alt={item.name}
              className="w-full h-full object-cover"
              src={item.image}
            />
            
            {/* Overlay hover */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <i className="far fa-heart absolute text-black top-5 right-5 border rounded-full border-[#D9D9D9] p-3 bg-[#D9D9D9] hover:bg-white"> </i>
              <button className="bg-black text-white py-2 px-4 rounded-lg mt-auto w-5/6 hover:bg-gray-800">
                Add to Cart
              </button>
            </div>
          </div>

          {/* Text section */}
        <Link to={`/product-detail/${item.id}`}>
          <div className="p-4">
            <h2 className="text-lg font-bold">{item.brand}</h2>
            <p className="text-gray-600">{item.name}</p>
            <div className="flex items-center mt-2">
              <span className="text-lg font-bold text-black">
                ${item.price}
              </span>
              <span className="text-gray-400 line-through ml-2">
                ${item.originalPrice}
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