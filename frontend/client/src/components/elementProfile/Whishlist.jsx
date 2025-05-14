import React, { useEffect, useState } from 'react'
import instanceAxios from '../../config/db';
import { Link } from "react-router-dom";


const Whishlist = () => {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    getWishlists();
  },[])

  const getWishlists = async () => {
    try{
        const {data} = await instanceAxios.get("/api/v1/customer/wishlist");
        setData(data.data);
      }catch(err){
        console.log(err);
      }
  }

  const handleToggleWishlist = async (productId) => {
    await instanceAxios.post("/api/v1/customer/wishlist", { product_id: productId });
    getWishlists();
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {data?.map((item) => (
          <div
            key={item.id}
            className="group bg-white dark:bg-gray-800 shadow-md dark:shadow-lg dark:shadow-gray-700 h-max rounded-lg overflow-hidden hover:shadow-xl duration-300 transition-transform transform hover:scale-105"
          >
            {/* Image section */}
            <div className="relative h-3/4">
              <img
                alt={item.name}
                className="w-full h-full object-cover"
                src={'https://storage.googleapis.com/a1aa/image/MSTn7yA3fyZFHAGlWXBk7nhwiz0apOyrlCgC-ufECbM.jpg'}
              />

              {/* Overlay hover */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <i onClick={() => handleToggleWishlist(item.id)} className="fas fa-trash-alt absolute text-red-500 top-5 right-5 border rounded-full border-[#D9D9D9] dark:border-gray-600 p-3 bg-[#D9D9D9] dark:bg-gray-700 hover:bg-white dark:hover:bg-gray-500"> </i>
                <button className="bg-black dark:bg-gray-900 text-white py-2 px-4 rounded-lg mt-auto w-5/6 hover:bg-gray-800 dark:hover:bg-gray-700">
                  Add to Cart
                </button>
              </div>
            </div>

            {/* Text section */}
            <Link to={`/shop/product-detail/${item.id}`}>
              <div className="p-4">
                <h2 className="text-lg font-bold dark:text-white">{item.brand}</h2>
                <p className="text-gray-600 dark:text-gray-300">{item.name}</p>
                <div className="flex items-center mt-2">
                  <span className="text-lg font-bold text-black dark:text-white">
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

export default Whishlist;