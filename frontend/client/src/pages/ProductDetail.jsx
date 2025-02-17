import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import RelatedProducts from "../components/elementProduct/RelatedProducts";

export const fakeData = {
    id: 1,
    brand: "YK Disney",
    name: "Girls Pink Moana Printed Dress",
    description:
      "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout...",
    color: ["Red", "Green", "Blue", "Black", "White"],
    size: ["S", "M", "L", "XL", "XXL"],
    fiveStart: 121,
    fourStart: 0,
    threeStart: 0,
    twoStart: 0,
    oneStart: 0,
    price: 80,
    oldPrice: 100,
    fav: false,
    image:
      "https://storage.googleapis.com/a1aa/image/sun96fvF1rSkAy7azff5bJJeOpU76F7KVNvUEigzuUkhQuaQB.jpg",
    thumbnails: new Array(5).fill(
      "https://storage.googleapis.com/a1aa/image/QNCvVWfsqJzfZ0jvriCecffdfOVWJX2zfjmqGoZFARG8a98DKA.jpg"
    ),
  };

const ProductDetail = () => {

  const {id} = useParams()
  const [quantity, setQuantity] = useState(1);
  const [data, setData] = useState(fakeData);
  const [selectedSize, setSelectedSize] = useState(null);
  const sliderRef = useRef(null);
  const [drag, setDrag] = useState({ isDown: false, startX: 0, scrollLeft: 0 });
  const location = useLocation()

  // Tính rating trung bình
  const totalVotes =
    data.fiveStart + data.fourStart + data.threeStart + data.twoStart + data.oneStart;
  const averageRating =
    totalVotes > 0
      ? (
          (data.fiveStart * 5 +
            data.fourStart * 4 +
            data.threeStart * 3 +
            data.twoStart * 2 +
            data.oneStart * 1) /
          totalVotes
        ).toFixed(1)
      : "N/A";

  // Thay đổi trạng thái yêu thích
  const handleFav = () => setData((prev) => ({ ...prev, fav: !prev.fav }));

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
    <section className="mx-10">
      <main className="container mx-auto py-8 px-4 md:px-0">
        <div className="text-sm text-gray-500 mb-4">
        <Link to="/home">Home</Link> &gt; <Link to="/shop">Shop</Link> &gt; {data.name}
        </div>
        <div className="flex flex-col md:flex-row">
          {/* Hình ảnh sản phẩm */}
          <div className="md:w-1/2">
            <img alt={data.name} className="w-full mb-4" src={data.image} />
            <div className="flex overflow-x-auto gap-x-2 scrollbar-hide select-none" ref={sliderRef}>
              {data.thumbnails.map((src, index) => (
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
            <h1 className="text-2xl font-bold mb-2">{data.brand}</h1>
            <p className="text-lg text-gray-600 mb-2">{data.name}</p>
            <div className="flex items-center mb-4 text-yellow-500">
              {Array(5)
                .fill()
                .map((_, i) => (
                  <i key={i} className="fas fa-star"></i>
                ))}
              <span className="text-gray-600 ml-2">({averageRating} Reviews)</span>
            </div>
            <div className="flex items-center mb-4">
              <span className="text-2xl font-bold text-gray-800">${data.price}.00</span>
              <span className="text-lg line-through text-gray-500 ml-4">
                ${data.oldPrice}.00
              </span>
            </div>
            <p className="text-gray-600 mb-4">{data.description}</p>

            {/* Chọn màu */}
            <div className="mb-4">
              <span className="text-gray-600">Color</span>
              <div className="flex space-x-2 mt-2">
                {data.color.map((color) => (
                  <div key={color} className="w-6 h-6 rounded-full shadow-md" style={{ backgroundColor: color }}></div>
                ))}
              </div>
            </div>

            {/* Chọn size */}
            <div className="mb-4">
              <span className="text-gray-600">Size</span>
              <div className="flex space-x-2 mt-2">
                {data.size.map((size) => (
                  <button
                    key={size}
                    className={`px-4 py-2 border rounded ${
                      selectedSize === size ? "bg-black text-white" : "border-gray-300"
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
              <button className="bg-black text-white rounded-lg px-16 py-2">Add to Cart</button>
              <button onClick={handleFav} className="border rounded-lg px-3 py-2">
                <i className={`fa${data.fav ? "s" : "r"} fa-heart`}></i>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Bộ 3 mô tả, thông tin , đánh giá */}
      <div className="mt-8">
          <div className="border-b border-gray-200 mb-4">
            <ul className="flex space-x-4">
              <Link to="descriptions" className={`pb-2 ${location.pathname === `/product-detail/${id}` || location.pathname.includes("descriptions") ? "border-b-2 border-black" : ""}`}>Descriptions</Link>
              <Link to="information" className={`pb-2 ${location.pathname.includes("information") ? "border-b-2 border-black" :""}`}>Additional Information</Link>
              <Link to="reviews" className={`pb-2 ${location.pathname.includes("reviews") ? "border-b-2 border-black" :""}`}>Reviews</Link>
            </ul>
          </div>
          <Outlet />
        </div>
      <div>
        {/* Sản phẩm gần đây */}
        <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Related Products</h2>
        <RelatedProducts />
        </div>
      </div>
    </section>
  )
}

export default ProductDetail