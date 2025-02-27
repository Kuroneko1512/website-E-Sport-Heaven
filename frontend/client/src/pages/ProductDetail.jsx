import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import RelatedProducts from "../components/elementProduct/RelatedProducts";
import { useQuery } from "@tanstack/react-query";
import instanceAxios from "../config/db";
import { Skeleton } from "antd";

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState({});
  const [selectedSize, setSelectedSize] = useState(null);
  const sliderRef = useRef(null);
  const [drag, setDrag] = useState({ isDown: false, startX: 0, scrollLeft: 0 });
  const location = useLocation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      return await instanceAxios.get(`/products/${id}`);
    },
  });

  useEffect(() => {
    if (data?.data) {
      setProduct(data.data);
    }
  }, []);

  console.log("product", product);

  // Tính rating trung bình
  const totalVotes = data?.data
    ? data.data.fiveStart +
      data.data.fourStart +
      data.data.threeStart +
      data.data.twoStart +
      data.data.oneStart
    : 0;
  const averageRating =
    totalVotes > 0
      ? (data?.data.fiveStart * 5 +
          data?.data.fourStart * 4 +
          data?.data.threeStart * 3 +
          data?.data.twoStart * 2 +
          data?.data.oneStart * 1) /
        totalVotes
      : "N/A";

  // Thay đổi trạng thái yêu thích
  const handleFav = () => {
    setProduct((prev) => (prev ? { ...prev, fav: !prev.fav } : null));
  };

  // Chọn size sản phẩm
  const handleSize = (size) => setSelectedSize(size);

  // Tăng / Giảm số lượng sản phẩm
  const handleQuantityChange = (delta) =>
    setQuantity((prev) => Math.max(1, prev + delta));

  // Xử lý sự kiện kéo slider
  const handleMouseDown = useCallback((e) => {
    if (!sliderRef.current) return;
    setDrag({
      isDown: true,
      startX: e.pageX - sliderRef.current.offsetLeft,
      scrollLeft: sliderRef.current.scrollLeft,
    });
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (!drag.isDown || !sliderRef.current) return;
      e.preventDefault();
      const walk = (e.pageX - sliderRef.current.offsetLeft - drag.startX) * 2;
      sliderRef.current.scrollLeft = drag.scrollLeft - walk;
    },
    [drag]
  );

  const handleMouseUpOrLeave = () => setDrag({ ...drag, isDown: false });

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    slider.addEventListener("mousedown", handleMouseDown);
    slider.addEventListener("mousemove", handleMouseMove);
    slider.addEventListener("mouseup", handleMouseUpOrLeave);
    slider.addEventListener("mouseleave", handleMouseUpOrLeave);

    return () => {
      slider.removeEventListener("mousedown", handleMouseDown);
      slider.removeEventListener("mousemove", handleMouseMove);
      slider.removeEventListener("mouseup", handleMouseUpOrLeave);
      slider.removeEventListener("mouseleave", handleMouseUpOrLeave);
    };
  }, [handleMouseDown, handleMouseMove]);

  return (
    <Skeleton loading={isLoading} active>
      <section className="mx-10">
        <main className="container mx-auto py-8 px-4 md:px-0">
          <div className="text-sm text-gray-500 mb-4">
            <Link to="/home">Home</Link> &gt; <Link to="/shop">Shop</Link> &gt;{" "}
            {data?.data?.name}
          </div>
          <div className="flex flex-col md:flex-row">
            {/* Hình ảnh sản phẩm */}
            <div className="md:w-1/2">
              <img
                alt={data?.data?.name}
                className="w-full mb-4"
                src={data?.data?.image}
              />
              <div
                className="flex overflow-x-auto gap-x-2 scrollbar-hide select-none"
                ref={sliderRef}
              >
                {data?.data?.thumbnails.map((src, index) => (
                  <img
                    key={index}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-1/4 flex-shrink-0"
                    src={src}
                    draggable={false}
                  />
                ))}
              </div>
            </div>
            {/* Thông tin chi tiết */}
            <div className="md:w-1/2 md:pl-8">
              <h1 className="text-2xl font-bold mb-2">{data?.data?.brand}</h1>
              <p className="text-lg text-gray-600 mb-2">{data?.data?.name}</p>
              <div className="flex items-center mb-4 text-yellow-500">
                {Array.from({ length: Math.round(averageRating) }, (_, i) => (
                  <i key={i} className="fas fa-star"></i>
                ))}
                {Array.from(
                  { length: 5 - Math.round(averageRating) },
                  (_, i) => (
                    <i key={i} className="far fa-star"></i>
                  )
                )}
                <span className="text-gray-600 ml-2">
                  ({totalVotes} Reviews)
                </span>
              </div>
              <div className="flex items-center mb-4">
                <span className="text-2xl font-bold text-gray-800">
                  ${data?.data?.price}
                </span>
                <span className="text-lg line-through text-gray-500 ml-4">
                  ${data?.data?.originalPrice}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{data?.data?.description}</p>

              {/* Chọn màu */}
              <div className="mb-4">
                <span className="text-gray-600">Color</span>
                <div className="flex space-x-2 mt-2">
                  {data?.data?.color.map((color) => (
                    <div
                      key={color}
                      className="w-6 h-6 rounded-full shadow-md"
                      style={{ backgroundColor: color }}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Chọn size */}
              <div className="mb-4">
                <span className="text-gray-600">Size</span>
                <div className="flex space-x-2 mt-2">
                  {data?.data?.size.map((size) => (
                    <button
                      key={size}
                      className={`px-4 py-2 border rounded ${
                        selectedSize === size
                          ? "bg-black text-white"
                          : "border-gray-300"
                      }`}
                      onClick={() => handleSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Thêm vào giỏ hàng */}
              <div className="flex space-x-4 mt-8">
                <div className="flex space-x-4 mt-8">
                  <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 space-x-4">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="text-gray-600"
                    >
                      <i className="fa-solid fa-minus"></i>
                    </button>
                    <span className="mx-2 text-gray-800">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="text-gray-600"
                    >
                      <i className="fa-solid fa-plus"></i>
                    </button>
                  </div>
                  {/* <button className="bg-black text-white rounded-lg px-16 py-2">Add to Cart</button>
              <button className="border border-gray-300 rounded-lg px-3 py-2">
                <FaHeart className="text-gray-600" />
              </button> */}
                  <button className="bg-black text-white rounded-lg px-16 py-2">
                    Add to Cart
                  </button>
                  <button
                    onClick={handleFav}
                    className="border rounded-lg px-3 py-2"
                  >
                    <i className={`fa${product?.fav ? "s" : "r"} fa-heart`}></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Bộ 3 mô tả, thông tin , đánh giá */}
        <div className="mt-8">
          <div className="border-b border-gray-200 mb-4">
            <ul className="flex space-x-4">
              <Link
                to="descriptions"
                className={`pb-2 ${
                  location.pathname === `/product-detail/${id}` ||
                  location.pathname.includes("descriptions")
                    ? "border-b-2 border-black"
                    : ""
                }`}
              >
                Descriptions
              </Link>
              <Link
                to="information"
                className={`pb-2 ${
                  location.pathname.includes("information")
                    ? "border-b-2 border-black"
                    : ""
                }`}
              >
                Additional Information
              </Link>
              <Link
                to="reviews"
                className={`pb-2 ${
                  location.pathname.includes("reviews")
                    ? "border-b-2 border-black"
                    : ""
                }`}
              >
                Reviews
              </Link>
            </ul>
          </div>
          <Outlet />
        </div>
        <div>
          {/* Sản phẩm gần đây */}
          <div className="my-8">
            <h2 className="text-2xl font-bold mb-4">Related Products</h2>
            <RelatedProducts />
          </div>
        </div>
      </section>
    </Skeleton>
  );
};

export default ProductDetail;