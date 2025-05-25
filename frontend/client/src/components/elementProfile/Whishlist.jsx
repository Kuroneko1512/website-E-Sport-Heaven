import React, { useEffect, useState } from 'react'
import instanceAxios from '../../config/db';
import { Link } from "react-router-dom";
import FomatVND from '../../utils/FomatVND';


const Whishlist = () => {
  const [data, setData] = useState([]);
  const [favMap, setFavMap] = useState({});
  
  useEffect(() => {
    getWishlists();
  },[])

  const getWishlists = async () => {
  try {
    const { data } = await instanceAxios.get("/api/v1/customer/wishlist");
    setData(data.data);
  } catch (err) {
    console.error("API Error:", err.response || err.message); // Log lỗi chi tiết
  }
};

console.log("Wishlist Data:", data); // Kiểm tra dữ liệu

  const handleToggleWishlist = async (productId) => {
  try {
    const response = await instanceAxios.post("/api/v1/customer/wishlist", { product_id: productId });
    console.log("Toggle Response:", response); // Kiểm tra phản hồi
    getWishlists();
  } catch (err) {
    console.error("Toggle Error:", err.response || err.message); // Log lỗi chi tiết
  }
};

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
              {data?.map((item) => (
                <div
                  key={item.id}
                  className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col"
                >
                  {/* Image section */}
                  <div className="relative aspect-[9/8] overflow-hidden">
                    <img
                      alt={item?.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      src={`http://127.0.0.1:8000/storage/${
                        item?.image || item?.variants[0]?.image
                      }`}
                      loading="lazy"
                    />
      
                    {/* Overlay hover */}
                    <Link to={`/shop/product-detail/${item?.id}`}>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                    </Link>
                    <i onClick={() => handleToggleWishlist(item.id)} className="fas fa-trash-alt absolute text-red-500 top-5 right-5 border rounded-full border-[#D9D9D9] dark:border-gray-600 p-3 bg-[#D9D9D9] dark:bg-gray-700 hover:bg-white dark:hover:bg-gray-500"> </i>
                  </div>
      
                  {/* Text section */}
                  <Link to={`/shop/product-detail/${item.id}`} className="flex-1 p-4">
                    <h2 className="text-sm md:text-2xl text-center font-bold text-gray-900 line-clamp-2 mb-2">
                      {item?.name}
                    </h2>
      
                    <div className="mt-auto">
                      <div className="flex items-center justify-center gap-2 min-h-[1.5rem]">
                        <div className="flex items-center flex-col">
                          <span className="text-base flex items-center md:text-lg font-bold text-yellow-500 mb-1" style={{ color: "#ff8c00" }}>
                            {FomatVND(
                              item?.price - (item?.price * item?.discount_percent) / 100 ||
                                item?.variants[0].price - 
                                  (item?.variants[0].price *
                                    item?.variants[0].discount_percent) /
                                    100
                            )}
                          {item?.discount_percent > 0 && (
                            <>
                              <span className="text-xs font-medium text-white bg-red-500 rounded ml-2 px-1.5 py-0.5">
                                -{parseFloat(item?.discount_percent)}%
                              </span>
                            </>
                          )}
                          </span>
                          {item?.discount_percent > 0 && (
                            <>
                              <span className="text-xs md:text-base text-gray-500 line-through">
                                {FomatVND(item?.price || item?.variants[0].price)}
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

export default Whishlist;