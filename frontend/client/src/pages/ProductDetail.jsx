import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import RelatedProducts from "../components/elementProduct/RelatedProducts";
import { useQuery } from "@tanstack/react-query";
import instanceAxios from "../config/db";
import { Skeleton } from "antd";

const ProductDetail = () => {
  // Lấy ID sản phẩm từ URL
  const { id } = useParams();

  // State quản lý sản phẩm, biến thể, thuộc tính, số lượng, và yêu thích
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [displayImage, setDisplayImage] = useState(""); // Ảnh hiển thị
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // Lấy thông tin sản phẩm từ API
  const { data: productDetailData, isLoading } = useQuery({
    queryKey: ["productDetailData", id],
    queryFn: async () => {
      const res = await instanceAxios.get(`/api/v1/product/${id}`);
      return res?.data;
    },
  });

  // Khi dữ liệu thay đổi, đặt biến thể mặc định là biến thể đầu tiên
  useEffect(() => {
    if (productDetailData?.data?.variants?.length > 0) {
      const defaultVariant = productDetailData.data.variants[0]; // Mặc định chọn biến thể đầu tiên
      setSelectedVariant(defaultVariant);
      setDisplayImage(defaultVariant.image || productDetailData?.data?.image); // Ảnh biến thể hoặc ảnh mặc định sản phẩm
    }
  }, [productDetailData]);

  // Lấy danh sách tất cả biến thể của sản phẩm
  const variants = productDetailData?.data?.variants || [];

  // Lấy tất cả các thuộc tính của sản phẩm
  const allAttributes = productDetailData?.data?.variants?.reduce(
    (acc, variant) => {
      variant.product_attributes.forEach((attr) => {
        if (!acc.some((a) => a.attribute_value.id === attr.attribute_value.id)) {
          acc.push(attr);
        }
      });
      return acc;
    },
    []
  ) || [];

  // Khi chọn một biến thể, cập nhật selectedVariant và ảnh hiển thị
  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    setSelectedAttribute(null); // Reset lựa chọn thuộc tính khi đổi biến thể
    setDisplayImage(variant.image || productDetailData?.data?.image); // Cập nhật ảnh hiển thị
  };

  // Khi chọn một thuộc tính, cập nhật selectedAttribute
  const handleAttributeSelect = (attribute) => {
    setSelectedAttribute(attribute);
  };

  // Xử lý thay đổi số lượng
  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  // Xử lý thay đổi trạng thái yêu thích
  const handleFavoriteToggle = () => {
    setIsFavorite((prev) => !prev);
  };

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
            {productDetailData?.data?.name}
          </div>
          <div className="flex flex-col md:flex-row">
            {/* Hình ảnh sản phẩm */}
            <div className="md:w-1/2">
            <img
                alt={productDetailData?.data?.name}
                className="w-full mb-4"
                src={displayImage} // Hiển thị ảnh biến thể hoặc ảnh mặc định
              />

              {/* <div
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
              </div> */}
            </div>
            {/* Thông tin chi tiết */}
            <div className="md:w-1/2 md:pl-8">
              <h1 className="text-2xl font-bold mb-2">{productDetailData?.data?.name}</h1>
              <p className="text-lg text-gray-600 mb-2">{productDetailData?.data?.status}</p>

              {/* Rating */}
              {/* <div className="flex items-center mb-4 text-yellow-500">
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
              </div> */}

              <div className="flex items-center mb-4">
                <span className="text-2xl font-bold text-gray-800">
                ${parseFloat(selectedVariant?.price).toFixed(2) || parseFloat(productDetailData?.data?.price).toFixed(2)}
                </span>
                {/* <span className="text-lg line-through text-gray-500 ml-4">
                  ${data?.data?.originalPrice}
                </span> */}
              </div>
              <p className="text-gray-600 mb-4">{data?.data?.description}</p>

              {/* Chọn biến thể (Variant) */}
              <div className="mb-4">
                <span className="text-gray-600">Choose Variant:</span>
                <div className="flex space-x-2 mt-2">
                  {variants.map((variant) => (
                    <button
                      key={variant.sku}
                      onClick={() => handleVariantSelect(variant)}
                      className={`px-4 py-2 border rounded ${
                        selectedVariant?.sku === variant.sku
                          ? "bg-black text-white"
                          : "border-gray-300"
                      }`}
                    >
                      {variant.sku}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hiển thị số lượng tồn kho của biến thể */}
              <p className="text-gray-600 mb-2">
                <strong>Stock:</strong> {selectedVariant?.stock} items
              </p>

              {/* Chọn thuộc tính của biến thể */}
              <div className="mb-4">
                <span className="text-gray-600">Choose Attributes:</span>
                <div className="flex space-x-2 mt-2">
                  {allAttributes.map((attr) => {
                    const isDisabled = !selectedVariant?.product_attributes.some(
                      (variantAttr) => variantAttr.attribute_value.id === attr.attribute_value.id
                    );
                    const isSelected =
                      selectedAttribute?.attribute_value.id === attr.attribute_value.id;

                    return (
                      <button
                        key={attr.attribute_value.id}
                        onClick={() => !isDisabled && handleAttributeSelect(attr)}
                        className={`px-4 py-2 border rounded ${
                          isSelected
                            ? "bg-black text-white"
                            : isDisabled
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "border-gray-300"
                        }`}
                        disabled={isDisabled}
                      >
                        {attr.attribute_value.value}
                      </button>
                    );
                  })}
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