import { useMutation, useQuery } from "@tanstack/react-query";
import { message, Skeleton } from "antd";
import React, { useEffect, useState } from "react";
import { Link, Outlet, useParams } from "react-router-dom";
import instanceAxios from "../config/db";
import RelatedProducts from "../components/elementProduct/RelatedProducts";


const ProductDetail = () => {
  const { id } = useParams();

  // State quản lý sản phẩm, biến thể, thuộc tính, số lượng, và yêu thích
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [displayImage, setDisplayImage] = useState(""); // Ảnh hiển thị
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [drag, setDrag] = useState({ isDown: false, startX: 0, scrollLeft: 0 });
  const [fav, setFav] = useState(false)
  // State quản lý sản phẩm
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [attributes, setAttributes] = useState([]);
  const [validOptions, setValidOptions] = useState({});

  // console.log("selectedVariant:", selectedVariant)

  // Lấy thông tin sản phẩm từ API
  const { data: productDetailData, isLoading } = useQuery({
    queryKey: ["productDetailData", id],
    queryFn: async () => {
      const res = await instanceAxios.get(`/api/v1/product/${id}/Detail`);
      return res?.data;
    },
  });

  console.log("productDetailData:",productDetailData)

  const product = productDetailData?.data;
  const productType = product?.product_type;
  const variants = product?.variants || [];
  const hasVariants = productType === "variable" && variants.length > 0;

  // API lấy danh sách thuộc tính từ `used_attributes`
  const fetchAttributes = useMutation({
    mutationFn: async () => {
      if (!product?.used_attributes?.length) return;
      const res = await instanceAxios.post(`/api/v1/attribute/filter`, {
        attribute_ids: product.used_attributes,
      });
      return res?.data?.data;
    },
    onSuccess: (data) => {
      setAttributes(data);
    }
  });

  // Gọi API lấy thuộc tính khi có dữ liệu sản phẩm
  useEffect(() => {
    if (product?.used_attributes?.length > 0) {
      fetchAttributes.mutate();
    }
  }, [product]);

  // Cập nhật danh sách hợp lệ ngay sau khi `attributes` được lấy từ API
  useEffect(() => {
    if (attributes.length > 0 && hasVariants) {
      updateValidOptions(selectedAttributes);
    }
  }, [attributes]);

  // Xử lý biến thể mặc định
  useEffect(() => {
    if (hasVariants) {
      const defaultVariant = variants[0]; 
      setSelectedVariant(defaultVariant);
      setDisplayImage(defaultVariant.image || product.image);
      
      // Gán thuộc tính mặc định từ biến thể đầu tiên
      const defaultAttributes = {};
      defaultVariant.attributes.forEach(attr => {
        defaultAttributes[attr.attribute_id] = attr.value_id;
      });
      setSelectedAttributes(defaultAttributes);
      
      // Cập nhật danh sách giá trị hợp lệ
      updateValidOptions(defaultAttributes);
    } else {
      setDisplayImage(product?.image);
    }
  }, [product, hasVariants]);

  // **Sửa lỗi lọc giá trị hợp lệ**
  const updateValidOptions = (selectedAttrs) => {
    if (!hasVariants || attributes.length === 0) return;

    const newValidOptions = {};

    // Lưu tất cả giá trị hợp lệ ban đầu cho mỗi thuộc tính
    attributes.forEach(attr => {
      newValidOptions[attr.id] = attr.values.map(value => value.id);
    });

    // Lọc lại danh sách giá trị hợp lệ dựa trên các biến thể còn lại
    Object.entries(selectedAttrs).forEach(([attrId, valueId]) => {
      const matchingVariants = variants.filter(variant =>
        variant.attributes.some(a => a.attribute_id == attrId && a.value_id == valueId)
      );

      attributes.forEach(attr => {
        if (parseInt(attrId) !== attr.id) {
          const validValues = new Set();
          matchingVariants.forEach(variant => {
            variant.attributes.forEach(a => {
              if (a.attribute_id === attr.id) {
                validValues.add(a.value_id);
              }
            });
          });
          newValidOptions[attr.id] = Array.from(validValues);
        }
      });
    });

    setValidOptions(newValidOptions);
  };

  // Khi chọn thuộc tính
  const handleAttributeSelect = (attributeId, valueId) => {
    const updatedAttributes = { ...selectedAttributes, [attributeId]: valueId };
    setSelectedAttributes(updatedAttributes);

    // Tìm biến thể phù hợp với các thuộc tính mới
    const matchingVariant = variants.find(variant =>
      variant.attributes.every(attr => updatedAttributes[attr.attribute_id] === attr.value_id)
    );

    if (matchingVariant) {
      setSelectedVariant(matchingVariant);
      setDisplayImage(matchingVariant.image || product?.image);
    }

    // Cập nhật danh sách giá trị hợp lệ
    updateValidOptions(updatedAttributes);
  };

  // Xử lý thay đổi số lượng
  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
  
    if (selectedVariant) {
      let cartItem = {
        product_id: product.id,
        variant_id: selectedVariant.id,
        quantity: quantity,
      };
  
      // Kiểm tra xem sản phẩm cùng variant đã có trong giỏ hàng chưa
      const existingIndex = cartItems.findIndex(
        (item) => item.product_id === cartItem.product_id && item.variant_id === cartItem.variant_id
      );
  
      if (existingIndex !== -1) {
        // Nếu đã có, cập nhật số lượng
        cartItems[existingIndex].quantity += cartItem.quantity;
      } else {
        // Nếu chưa có, thêm vào giỏ hàng
        cartItems.push(cartItem);
      }
    } else {
      let cartItem = {
        product_id: product.id,
        quantity: quantity,
      };
  
      // Kiểm tra nếu sản phẩm cùng ID đã tồn tại (không có variant)
      const existingIndex = cartItems.findIndex(
        (item) => item.product_id === cartItem.product_id && !item.variant_id
      );
  
      if (existingIndex !== -1) {
        cartItems[existingIndex].quantity += cartItem.quantity;
      } else {
        cartItems.push(cartItem);
      }
    }
  
    // Lưu lại giỏ hàng vào localStorage
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    message.success("Thêm thành công")
  };
  

  // Tính rating trung bình
  // const totalVotes = data?.data
  //   ? data.data.fiveStart +
  //     data.data.fourStart +
  //     data.data.threeStart +
  //     data.data.twoStart +
  //     data.data.oneStart
  //   : 0;
  // const averageRating =
  //   totalVotes > 0
  //     ? (data?.data.fiveStart * 5 +
  //         data?.data.fourStart * 4 +
  //         data?.data.threeStart * 3 +
  //         data?.data.twoStart * 2 +
  //         data?.data.oneStart * 1) /
  //       totalVotes
  //     : "N/A";

  return (
    <Skeleton loading={isLoading} active>
      <section className="mx-10">
        <main className="container mx-auto py-8 px-4 md:px-0">
          <div className="text-sm text-gray-500 mb-4">
            <Link to="/home">Home</Link> &gt; <Link to="/shop">Shop</Link> &gt;{" "}
            {product?.name}
          </div>
          <div className="flex flex-col md:flex-row">
            {/* Hình ảnh sản phẩm */}
            <div className="md:w-1/2">
              <img alt={product?.name} className="w-full mb-4" src={displayImage} />
            </div>

            {/* Thông tin sản phẩm */}
            <div className="md:w-1/2 md:pl-8">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold mb-2">
                {product?.name}
              </h1>
              <span className={`${product?.status === "active" ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"} px-2 py-1 rounded`}>
                {product?.status}
              </span>
              </div>

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

                {(product?.product_type === "simple") ? (
                   <div className="flex items-center mb-4">
                   {parseFloat(product?.discount?.percent) >= 0 ? (
                     <div>
                       <span className="text-xl font-bold text-gray-800">
                       ${parseFloat(product?.price).toFixed(2)}
                   </span>
                   <span className="text-lg line-through text-gray-500 ml-4">
                     ${((parseFloat(product?.price)) - (parseFloat(product?.price)*parseFloat(product?.discount?.percent))/100).toFixed(2)}
                   </span>
                     </div>
                   ): (
                   <span className="text-xl font-bold text-gray-800">
                     ${parseFloat(product?.price).toFixed(2)}
                   </span> 
                   )}
                 </div>
                ): (
                  <div className="flex items-center mb-4">
                  {parseFloat(product?.discount?.percent) >= 0 ? (
                    <div>
                      <span className="text-xl font-bold text-gray-800">
                      ${parseFloat(selectedVariant?.price).toFixed(2)}
                  </span>
                  <span className="text-lg line-through text-gray-500 ml-4">
                    ${((parseFloat(selectedVariant?.price)) - (parseFloat(selectedVariant?.price)*parseFloat(product?.discount?.percent))/100).toFixed(2)}
                  </span>
                    </div>
                  ): (
                  <span className="text-xl font-bold text-gray-800">
                    ${parseFloat(selectedVariant?.price).toFixed(2)}
                  </span> 
                  )}
                </div>
                )}
              <p className="text-gray-600 mb-4">{product?.description}</p>

              {/* Chọn thuộc tính */}
              {hasVariants && attributes.length > 0 && attributes.map(attr => (
                <div key={attr.id} className="mb-4">
                  <span className="text-gray-600">{attr.name}:</span>
                  <div className="flex space-x-2 mt-2">
                    {attr.values.map(value => (
                      <button
                        key={value.id}
                        onClick={() => handleAttributeSelect(attr.id, value.id)}
                        className={`px-4 py-2 border rounded ${
                          selectedAttributes[attr.id] === value.id ? "bg-black text-white" : "border-gray-300"
                        } ${
                          validOptions[attr.id]?.includes(value.id) ? "" : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                        disabled={!validOptions[attr.id]?.includes(value.id)}
                      >
                        {value.value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Hiển thị số lượng tồn kho của biến thể */}
              <p className="text-gray-600 mb-2">
                <strong>Stock:</strong> {selectedVariant?.stock || 0} items
              </p>

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

                  {(product?.status === "inactive") ? (
                      <button className="bg-black text-white rounded-lg px-16 py-2 disabled:bg-gray-800 disabled:cursor-not-allowed" onClick={handleAddToCart} disabled>
                      Add to Cart
                    </button>
                  ): (
                    <button className="bg-black text-white rounded-lg px-16 py-2" onClick={handleAddToCart}>
                    Add to Cart
                  </button>
                  ) }
                  
                  <button
                    onClick={()=>setFav(!fav)}
                    className="border rounded-lg px-3 py-2"
                  >
                    <i className={`fa${fav === true ? "s" : "r"} fa-heart`}></i>
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
