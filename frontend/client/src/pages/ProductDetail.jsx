import { useMutation, useQuery } from "@tanstack/react-query";
import { message, Skeleton } from "antd";
import React, { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import Description from "../components/elementProduct/Description";
// import AdditionalInformation from "../components/elementProduct/AdditionalInformation";
import Review from "../components/elementProduct/Review";
import instanceAxios from "../config/db";
import RelatedProducts from "../components/elementProduct/RelatedProducts";
import ScrollToTop from "../config/ScrollToTop";
import FomatVND from "../utils/FomatVND";
import Cookies from "js-cookie";
import useEchoChannel from "../hooks/useEchoChannel.js";

const ProductDetail = () => {
  const [isAllAttributesSelected, setIsAllAttributesSelected] = useState(false);
  const { id } = useParams();

  // State quản lý sản phẩm, biến thể, thuộc tính, số lượng, và yêu thích
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [displayImage, setDisplayImage] = useState(""); // Ảnh hiển thị
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [drag, setDrag] = useState({ isDown: false, startX: 0, scrollLeft: 0 });
  const [fav, setFav] = useState(false);
  // State quản lý sản phẩm
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [attributes, setAttributes] = useState([]);
  const [validOptions, setValidOptions] = useState({});
  const [chon, setChon] = useState([]);
  const [activeTab, setActiveTab] = useState("description");
  const [previousProductData, setPreviousProductData] = useState(null);
  const [hasProductChanged, setHasProductChanged] = useState(false);

  const { data: productDetailData, isLoading, refetch } = useQuery({
    queryKey: ["productDetailData", id],
    queryFn: async () => {
      const res = await instanceAxios.get(`/api/v1/product/${id}/Detail`);
      return res?.data;
    },
  });

  console.log("productDetailData", productDetailData);

  const product = productDetailData?.data;
  const variants = product?.variants || [];
  const hasVariants =
    product?.product_type === "variable" && variants.length > 0;

  const handleProductUpdate = useCallback((event) => {
    console.log('🔔 Nhận được event:', event);

    // Lưu dữ liệu cũ TRƯỚC KHI refetch
    if (product) {
      console.log('💾 Lưu dữ liệu cũ:', product);
      setPreviousProductData(product);

      // Delay một chút rồi mới refetch để đảm bảo state được set
      setTimeout(() => {
        console.log('🔄 Bắt đầu refetch...');
        refetch();
      }, 100);
    }
  }, [refetch, product]);

  const { connected, error: echoError } = useEchoChannel(
      'Product.2',
      '.product-update',
      handleProductUpdate
  );

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
    },
  });

  // Gọi API lấy thuộc tính khi có dữ liệu sản phẩm
  useEffect(() => {
    if (product?.used_attributes?.length > 0) {
      fetchAttributes.mutate();
    }
    setDisplayImage(product?.image || "");
  }, [product]);

  // Cập nhật hình ảnh và giá của biến thể đầu tiên nếu có biến thể
  useEffect(() => {
    if (hasVariants) {
      // Chọn biến thể đầu tiên
      const defaultVariant = variants[0];
      setSelectedVariant(defaultVariant);
      setDisplayImage(defaultVariant.image || product?.image); // Hiển thị ảnh của biến thể đầu tiên
    } else {
      // Nếu sản phẩm là loại simple, hiển thị ảnh của sản phẩm mặc định
      setDisplayImage(product?.image || "");
    }
  }, [product, hasVariants, variants]);

  // Cập nhật danh sách hợp lệ ngay sau khi `attributes` được lấy từ API
  useEffect(() => {
    if (attributes.length > 0 && hasVariants) {
      updateValidOptions(selectedAttributes);
    }
  }, [attributes]);

  // Xử lý biến thể mặc định
  useEffect(() => {
    setIsAllAttributesSelected(
      hasVariants &&
        Object.keys(selectedAttributes).length === attributes.length
    );
  }, [selectedAttributes, attributes]);

  useEffect(() => {
    instanceAxios
      .get(`/api/v1/customer/wishlist-product/${id}`)
      .then((response) => {
        setFav(response.data.data);
      });
  }, []);

  // Cập nhật danh sách hợp lệ ngay sau khi người dùng chọn thuộc tính
  const updateValidOptions = (selectedAttrs) => {
    if (!hasVariants || attributes.length === 0) return;
    const newValidOptions = {};

    attributes.forEach((attr) => {
      newValidOptions[attr.id] = attr.values.map((value) => value.id);
    });

    Object.entries(selectedAttrs).forEach(([attrId, valueId]) => {
      const matchingVariants = variants.filter((variant) =>
        variant.attributes.some(
          (a) => a.attribute_id == attrId && a.value_id == valueId
        )
      );

      attributes.forEach((attr) => {
        if (parseInt(attrId) !== attr.id) {
          const validValues = new Set();
          matchingVariants.forEach((variant) => {
            variant.attributes.forEach((a) => {
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

  // Xử lý biến thể khi người dùng chọn
  const handleAttributeSelect = (attributeId, valueId) => {
    // Check if this value is already selected
    const isAlreadySelected = selectedAttributes[attributeId] === valueId;
    // Create updated attributes
    const updatedAttributes = isAlreadySelected
      ? { ...selectedAttributes }
      : { ...selectedAttributes, [attributeId]: valueId };
    // If deselecting, remove the attribute
    if (isAlreadySelected) {
      delete updatedAttributes[attributeId];
    }

    setIsAllAttributesSelected(
      Object.keys(updatedAttributes).length === attributes.length
    );

    setSelectedAttributes(updatedAttributes);

    // Find matching variant only if all attributes are selected
    if (Object.keys(updatedAttributes).length === attributes.length) {
      const matchingVariant = variants.find((variant) =>
        variant.attributes.every(
          (attr) => updatedAttributes[attr.attribute_id] === attr.value_id
        )
      );

      if (matchingVariant) {
        setSelectedVariant(matchingVariant);
        setDisplayImage(matchingVariant.image || product?.image);
      }
    } else {
      // If not all attributes selected, reset variant
      setSelectedVariant(null);
    }

    updateValidOptions(updatedAttributes);
  };

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => {
      const stock = selectedVariant
        ? selectedVariant.stock
        : product?.stock || 0;
      let newQuantity = prev + delta;

      if (newQuantity > stock) {
        return stock; // Không cho phép vượt quá tồn kho
      }

      if (newQuantity < 1) {
        return 1; // Không cho phép giảm dưới 1
      }

      return newQuantity;
    });
  };

  const handleToggleWishlist = async (favParam) => {
    const userRaw = Cookies.get("user");

    if (!userRaw) {
      message.error("Bạn cần đăng nhập để thêm sản phẩm vào yêu thích.");
      return;
    }
    setFav(favParam);
    await instanceAxios.post("/api/v1/customer/wishlist", { product_id: id });
  };

  const handleAddToCart = () => {
    if (product?.variants?.length > 0) {
      if (!isAllAttributesSelected) {
        message.error(
          "Vui lòng chọn đầy đủ thuộc tính trước khi thêm vào giỏ hàng."
        );
        return;
      }
    }

    const generateId = () =>
      Date.now() + Math.random().toString(36).substr(2, 9);
    let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    let cartItem = {
      id: generateId(),
      product_id: product.id,
      variant_id: selectedVariant?.id || null,
      quantity: quantity,
      image: product.image || selectedVariant?.image,
      name: product.name,
      price: selectedVariant?.price || product.price,
      discount: product.discount?.percent,
      stock: selectedVariant?.stock || product.stock,
      sku: selectedVariant?.sku || product.sku,
      thuoc_tinh: chon,
    };

    const existingIndex = cartItems.findIndex(
      (item) =>
        item.product_id === cartItem.product_id &&
        item.variant_id === cartItem.variant_id
    );

    if (existingIndex !== -1) {
      const existingItem = cartItems[existingIndex];
      const newQuantity = existingItem.quantity + cartItem.quantity;
      const stock = selectedVariant?.stock || product.stock;

      if (newQuantity > stock) {
        message.error("Số lượng vượt quá tồn kho. Vui lòng kiểm tra lại.");
        return;
      }

      cartItems[existingIndex].quantity = newQuantity;
    } else {
      if (cartItem.quantity > (selectedVariant?.stock || product.stock)) {
        message.error("Số lượng vượt quá tồn kho. Vui lòng kiểm tra lại.");
        return;
      }

      cartItems.push(cartItem);
    }

    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    message.success("Thêm thành công");
    const event = new CustomEvent("cartUpdated", { detail: cartItems });
    window.dispatchEvent(event);
  };

  const value_attribute = (value) => {
    console.log(value);
    setChon([...chon, value]);
  };

  // console.log("Chon", chon);

  useEffect(() => {
    if (attributes.length > 0) {
      setIsAllAttributesSelected(
        Object.keys(selectedAttributes).length === attributes.length
      );
    }
  }, [attributes, selectedAttributes]);

  useEffect(() => {
    console.log('🔍 useEffect chạy');
    console.log('🔍 previousProductData:', previousProductData);
    console.log('🔍 product:', product);

    if (previousProductData && product) {
      console.log('✅ Có cả previousProductData và product');

      const changes = [];

      // Tính giá bán thực tế (có tính discount)
      const calculateFinalPrice = (productData) => {
        const basePrice = parseFloat(productData.price);
        const discountPercent = parseFloat(productData.discount?.percent) || 0;
        return basePrice - (basePrice * discountPercent / 100);
      };

      const oldFinalPrice = calculateFinalPrice(previousProductData);
      const newFinalPrice = calculateFinalPrice(product);

      console.log('🔍 So sánh giá bán thực tế:');
      console.log('- Giá bán cũ:', oldFinalPrice);
      console.log('- Giá bán mới:', newFinalPrice);

      // So sánh giá bán thực tế
      if (oldFinalPrice !== newFinalPrice) {
        console.log('✅ Giá bán đã thay đổi!');
        const priceChange = newFinalPrice > oldFinalPrice ? 'tăng' : 'giảm';
        changes.push(`Giá ${priceChange} từ ${FomatVND(oldFinalPrice)} thành ${FomatVND(newFinalPrice)}`);
      } else {
        console.log('❌ Giá bán không thay đổi');
      }

      // So sánh các thông tin khác
      if (previousProductData.name !== product.name) {
        changes.push(`Tên sản phẩm đã thay đổi`);
      }

      if (previousProductData.status !== product.status) {
        const statusText = product.status === 'active' ? 'Còn hàng' : 'Hết hàng';
        changes.push(`Trạng thái: ${statusText}`);
      }

      if (previousProductData.stock !== product.stock) {
        changes.push(`Tồn kho: ${product.stock} sản phẩm`);
      }

      console.log('🔍 Changes array:', changes);

      if (changes.length > 0) {
        console.log('✅ Sẽ hiển thị thông báo');
        message.info({
          content: (
              <div>
                <strong>🔔 Sản phẩm đã được cập nhật:</strong>
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                  {changes.map((change, index) => (
                      <li key={index}>{change}</li>
                  ))}
                </ul>
              </div>
          ),
          duration: 5
        });
      } else {
        console.log('❌ Không có thay đổi nào');
      }

      // Reset previousProductData sau khi đã thông báo
    } else {
      console.log('❌ Thiếu previousProductData hoặc product');
      setPreviousProductData(null);
    }
  }, [product, previousProductData]);


  return (
    <div>
      {isLoading ? (
        <div className="h-screen flex justify-center items-center">
          <div className="text-center text-gray-500 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-gray-500"></div>
            <p>Đang tải sản phẩm...</p>
          </div>
        </div>
      ) : (
        <div>
          <ScrollToTop />
          <section className="mx-10">
            <main className="container mx-auto py-8 px-4 md:px-0">
              <div className="text-sm text-gray-500 mb-4">
                <Link to="/home">Trang chủ</Link> >{" "}
                <Link to="/shop">Cửa hàng</Link> > {product?.name}
              </div>

              <div className="flex flex-col md:flex-row">
                {/* Hình ảnh sản phẩm */}
                <div className="md:w-1/3">
                  <img
                    alt={product?.name}
                    className="w-full h-[400px] object-cover mb-4"
                    src={`http://127.0.0.1:8000/storage/${displayImage}`}
                  />
                </div>

                {/* Thông tin sản phẩm */}
                <div className="md:w-1/2 md:pl-8">
                  <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold mb-2">{product?.name}</h1>
                    <span
                      className={`${
                        product?.status === "active"
                          ? "text-green-700 bg-green-100"
                          : "text-red-700 bg-red-100"
                      } px-2 py-1 rounded`}
                    >
                      {product?.status === "active" ? "Còn hàng" : "Hết hàng"}
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

                  {/* Giá sản phẩm */}
                  {product?.product_type === "simple" ? (
                    <div className="flex items-center mb-4">
                      {parseFloat(product?.discount?.percent) > 0 ? (
                        <div>
                          <span className="text-xl font-bold text-gray-800">
                            {FomatVND(
                              parseFloat(product?.price) -
                                (parseFloat(product?.price) *
                                  parseFloat(product?.discount?.percent)) /
                                  100
                            )}
                          </span>
                          <span className="text-lg line-through text-gray-500 ml-4">
                            {FomatVND(product?.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xl font-bold text-gray-800">
                          {FomatVND(product?.price)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center mb-4">
                      {selectedVariant || isAllAttributesSelected ? (
                        parseFloat(product?.discount?.percent) > 0 ? (
                          <div>
                            <span className="text-xl font-bold text-gray-800">
                              {FomatVND(
                                parseFloat(
                                  selectedVariant?.price || variants[0]?.price
                                ) -
                                  (parseFloat(
                                    selectedVariant?.price || variants[0]?.price
                                  ) *
                                    parseFloat(product?.discount?.percent)) /
                                    100
                              )}
                            </span>
                            <span className="text-lg line-through text-gray-500 ml-4">
                              {FomatVND(
                                selectedVariant?.price || variants[0]?.price
                              )}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xl font-bold text-gray-800">
                            {FomatVND(
                              selectedVariant?.price || variants[0]?.price
                            )}
                          </span>
                        )
                      ) : (
                        <div>
                          <span className="text-xl font-bold text-gray-800">
                            {FomatVND(variants[0]?.price || product?.price)}
                          </span>
                          {hasVariants && !isAllAttributesSelected && (
                            <span className="text-sm text-gray-500 ml-2">
                              (Chọn đầy đủ thuộc tính)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mô tả ngắn */}
                  {/* <p className="text-gray-600 mb-4">{product?.description}</p> */}

                  {/* Chọn thuộc tính */}
                  {hasVariants &&
                    attributes.map((attr) => {
                      // Lọc ra những giá trị thực sự tồn tại trong các biến thể
                      const validValueIdsInVariants = new Set();
                      variants.forEach((variant) => {
                        variant.attributes.forEach((a) => {
                          if (a.attribute_id === attr.id) {
                            validValueIdsInVariants.add(a.value_id);
                          }
                        });
                      });

                      const filteredValues = attr.values.filter((v) =>
                        validValueIdsInVariants.has(v.id)
                      );

                      return (
                        <div key={attr.id} className="mb-4">
                          <span>{attr.name}:</span>
                          <div className="flex space-x-2 mt-2 flex-wrap">
                            {filteredValues.map((value) => {
                              const isSelected =
                                selectedAttributes[attr.id] === value.id;
                              const isDisabled =
                                !validOptions[attr.id]?.includes(value.id) &&
                                !isSelected; // luôn cho phép chọn lại, chỉ disabled nếu không hợp lệ và chưa chọn

                              return (
                                <button
                                  key={value.id}
                                  onClick={() => {
                                    handleAttributeSelect(attr.id, value.id),
                                      value_attribute(value.value);
                                  }}
                                  className={`px-4 py-2 border rounded transition-all duration-150 ${
                                    isSelected
                                      ? "bg-black text-white"
                                      : "border-gray-300 hover:bg-gray-100"
                                  } ${
                                    isDisabled
                                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                      : ""
                                  }`}
                                  disabled={isDisabled}
                                >
                                  {value.value}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}

                  {/* Hiển thị số lượng tồn kho của biến thể */}
                  <p className="text-gray-600 mb-2">
                    <strong>Kho:</strong>{" "}
                    {hasVariants && !isAllAttributesSelected
                      ? variants[0]?.stock || 0
                      : selectedVariant?.stock || product?.stock || 0}{" "}
                  </p>

                  <div className="flex space-x-4 mt-8">
                    <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 space-x-4">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        className="text-gray-600"
                      >
                        <i className="fa-solid fa-minus"></i>
                      </button>
                      <input
                        type="text"
                        value={quantity}
                        min={1}
                        max={
                          selectedVariant
                            ? selectedVariant.stock
                            : product?.stock || 0
                        }
                        onChange={(e) => {
                          let value = parseInt(e.target.value, 10);
                          const stock = selectedVariant
                            ? selectedVariant.stock
                            : product?.stock || 0;

                          if (isNaN(value) || value < 1) value = 1;
                          if (value > stock) value = stock;

                          setQuantity(value);
                        }}
                        className="text-center"
                        style={{ width: `${quantity.toString().length + 1}ch` }}
                      />
                      <button
                        onClick={() => handleQuantityChange(1)}
                        className="text-gray-600"
                      >
                        <i className="fa-solid fa-plus"></i>
                      </button>
                    </div>

                    {/* Thêm vào giỏ hàng */}
                    {product?.status === "active" &&
                    (product?.stock > 0 || selectedVariant?.stock > 0) ? (
                      <div>
                        {product?.product_type === "simple" ? (
                          <button
                            className="bg-black hover:bg-gray-800 text-white rounded-lg px-16 py-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
                            onClick={handleAddToCart}
                          >
                            Thêm vào giỏ hàng
                          </button>
                        ) : (
                          <button
                            className="bg-black hover:bg-gray-800 text-white rounded-lg px-16 py-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
                            onClick={handleAddToCart}
                            disabled={
                              !isAllAttributesSelected ||
                              attributes.length === 0
                            }
                          >
                            Thêm vào giỏ hàng
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        className="bg-black hover:bg-gray-800 text-white rounded-lg px-16 py-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
                        disabled={true}
                      >
                        Thêm vào giỏ hàng
                      </button>
                    )}

                    <button
                      onClick={() => handleToggleWishlist(!fav)}
                      className="border rounded-lg px-3 py-2"
                    >
                      <i
                        className={`fa${fav === true ? "s" : "r"} fa-heart`}
                      ></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bộ 3 mô tả, thông tin , đánh giá */}
              <div className="mt-8">
                <div className="border-b border-gray-200 mb-4">
                  <ul className="flex space-x-4">
                    <button
                      onClick={() => setActiveTab("description")}
                      className={`pb-2 ${
                        activeTab === "description"
                          ? "border-b-2 border-black"
                          : ""
                      }`}
                    >
                      Mô tả
                    </button>
                    {/* <button
                      onClick={() => setActiveTab('information')}
                      className={`pb-2 ${activeTab === 'information' ? 'border-b-2 border-black' : ''}`}
                    >
                      Thông tin bổ sung
                    </button> */}
                    <button
                      onClick={() => setActiveTab("reviews")}
                      className={`pb-2 ${
                        activeTab === "reviews" ? "border-b-2 border-black" : ""
                      }`}
                    >
                      Đánh giá
                    </button>
                  </ul>
                </div>

                {activeTab === "description" && (
                  <Description product={product} />
                )}
                {activeTab === "information" && (
                  <AdditionalInformation product={product} />
                )}
                {activeTab === "reviews" && <Review product={product} />}
              </div>

              {/* Sản phẩm gần đây */}
              <div className="my-8">
                <h2 className="text-2xl font-bold mb-4">
                  Các sản phẩm liên quan
                </h2>
                <RelatedProducts />
              </div>
            </main>
          </section>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
