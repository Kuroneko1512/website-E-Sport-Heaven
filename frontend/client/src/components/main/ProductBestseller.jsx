import React, { useEffect, useState } from "react"; 
import { Link } from "react-router-dom";
import FomatVND from "../../utils/FomatVND";
import Cookies from "js-cookie";
import instanceAxios from "../../config/db";
import { message } from "antd";

const ProductBestseller = ({productDataB}) => {

  const [favMap, setFavMap] = useState({});

  // Lấy trạng thái yêu thích cho tất cả sản phẩm khi mount
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!productDataB) return;
      const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;
      if (!user) return;
      try {
        const productIds = productDataB.map(item => item.id);
        const res = await instanceAxios.post('/api/v1/customer/wishlist-products', { product_ids: productIds });
        setFavMap(res.data.data || {});
      } catch {
        setFavMap({});
      }
    };
    fetchWishlist();
  }, [productDataB]);

  // Xử lý khi nhấn nút yêu thích
  const handleToggleWishlist = async (productId) => {
    const userRaw = Cookies.get("user");
    if (!userRaw) {
      message.error("Bạn cần đăng nhập để thêm sản phẩm vào yêu thích.");
      return;
    }
    // Đảo trạng thái yêu thích cho sản phẩm này
    setFavMap((prev) => ({
      ...prev,
      [productId]: !prev[productId]
    }));
    await instanceAxios.post("/api/v1/customer/wishlist", { product_id: productId });
  };

  console.log("productDataBB", productDataB);
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">Sản phẩm bán chạy</h1>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-6">
        {productDataB?.map((item) => (
          <div
            key={item?.id}
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
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              </div>
              </Link>
              <button
                className="absolute top-3 right-3 py-1 px-2 bg-white/80 rounded-full hover:bg-white transition-colors duration-200 opacity-0 group-hover:opacity-100 "
                onClick={() => handleToggleWishlist(item.id)}
              >
                <i className={`fa${favMap[item.id] ? "s" : "r"} fa-heart text-gray-700`}></i>
              </button>
            </div>

            {/* Text section */}
            <Link 
              to={`/shop/product-detail/${item?.id}`}
              className="flex-1 p-4"
            >
              <h2 className="text-sm md:text-2xl font-bold text-center text-gray-900 line-clamp-2 mb-2">
                {item?.name}
              </h2>
              
              <div className="mt-auto">
                <div className="flex items-center justify-center gap-2 min-h-[1.5rem]">

                  <div className="flex items-center flex-col">
                    <span className="text-base flex items-center md:text-lg font-bold mb-1" style={{ color: "#ff8c00" }}>
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

export default ProductBestseller;