import { DeleteOutlined } from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Col,
  Image,
  message,
  Modal,
  Row,
  Space,
  Table,
  Typography,
} from "antd";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import FomatVND from "../utils/FomatVND";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import instanceAxios from "../config/db";
import useEchoChannel from "../hooks/useEchoChannel.js";

const { Title, Text } = Typography;

const Cart = () => {
  const [cartItems, setCartItems] = useState([]); // Lưu trữ danh sách sản phẩm trong giỏ hàng
  const [selectedItems, setSelectedItems] = useState([]); // Lưu trữ danh sách sản phẩm được chọn
  const [checkoutItems, setCheckoutItems] = useState([]); // Lưu trữ danh sách sản phẩm để thanh toán
  const nav = useNavigate(); // Điều hướng giữa các trang
  const [warningCount, setWarningCount] = useState(0); // Đếm số lần thông báo
  const [canWarn, setCanWarn] = useState(true); // Kiểm soát thời gian chờ thông báo
  const [productStockStatus, setProductStockStatus] = useState({}); // Lưu trữ trạng thái tồn kho
  const [forceUpdate, setForceUpdate] = useState(0);

  console.log("cartItems", cartItems)

  const queryClient = useQueryClient();

  const handleProductUpdate = useCallback((event) => {
    console.log('✅ Cart: Nhận được cập nhật sản phẩm:', event);

    // ✅ FORCE UPDATE BẰNG CÁCH THAY ĐỔI KEY
    setForceUpdate(prev => {
      console.log('🔄 Force update triggered:', prev + 1);
      return prev + 1;
    });
  }, []); // ✅ XÓA queryClient KHỎI DEPENDENCY

  const { connected: connectedUpdate } = useEchoChannel(
    'Product.2',
    '.product-update',
    handleProductUpdate
  );

  // Lấy thông tin tồn kho mới nhất cho tất cả sản phẩm trong giỏ hàng
  const { data: updatedCartData, isLoading: isLoadingCart, isError: isErrorCart } = useQuery({
    queryKey: ["cartItems", forceUpdate],
    queryFn: async () => {
      console.log('🔄 useQuery cartItems đang chạy...');
      const localCartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

      if (localCartItems.length === 0) return [];

      const stockPromises = localCartItems.map(async (item) => {
        try {
          const response = await instanceAxios.get(
            `/api/v1/product/${item.product_id}/variant/${item.variant_id || ''}`
          );
          
          if (response.data.success && response.data.data) {
            const productData = response.data.data;
            // Xử lý cho variant product
            if (item.variant_id && productData.variants?.length > 0) {
              const variant = productData.variants.find(v => v.id === item.variant_id);
              if (variant) {
                // ✅ TÍNH GIÁ BÁN THỰC TẾ (SAU KHI GIẢM GIÁ)
                const oldBasePrice = parseFloat(item.price) || 0;
                const oldDiscount = parseFloat(item.discount) || 0;
                const oldFinalPrice = oldBasePrice - (oldBasePrice * oldDiscount / 100);

                const newBasePrice = parseFloat(variant.price) || 0;
                const newDiscount = parseFloat(variant.discount_percent) || 0;
                const newFinalPrice = newBasePrice - (newBasePrice * newDiscount / 100);

                // console.log(`🔍 Product ${item.name}:`, {
                //   oldBasePrice,
                //   oldDiscount,
                //   oldFinalPrice,
                //   newBasePrice,
                //   newDiscount,
                //   newFinalPrice,
                //   finalPriceChanged: Math.abs(oldFinalPrice - newFinalPrice) > 0.01 // ✅ SO SÁNH GIÁ BÁN
                // });

                return {
                  ...item,
                  stock: variant.stock,
                  price: variant.price,
                  discount: variant.discount_percent || 0,
                  inStock: variant.stock >= item.quantity,
                  isActive: productData.status === 'active',
                  hasStockChanged: variant.stock !== parseInt(item.stock),
                  hasPriceChanged: Math.abs(oldFinalPrice - newFinalPrice) > 0.01, // ✅ SO SÁNH GIÁ BÁN
                  oldFinalPrice: oldFinalPrice, // ✅ LƯU GIÁ BÁN CŨ
                  newFinalPrice: newFinalPrice, // ✅ LƯU GIÁ BÁN MỚI
                  priceChangeTimestamp: Date.now(), // ✅ THÊM TIMESTAMP
                };
              }
            } else {
              // ✅ LOGIC CHO SIMPLE PRODUCT
              const oldBasePrice = parseFloat(item.price) || 0;
              const oldDiscount = parseFloat(item.discount) || 0;
              const oldFinalPrice = oldBasePrice - (oldBasePrice * oldDiscount / 100);

              const newBasePrice = parseFloat(productData.price) || 0;
              const newDiscount = parseFloat(productData.discount_percent) || 0;
              const newFinalPrice = newBasePrice - (newBasePrice * newDiscount / 100);

              console.log(`🔍 Simple Product ${item.name}:`, {
                oldBasePrice,
                oldDiscount,
                oldFinalPrice,
                newBasePrice,
                newDiscount,
                newFinalPrice,
                finalPriceChanged: Math.abs(oldFinalPrice - newFinalPrice) > 0.01
              });

              return {
                ...item,
                stock: productData.stock,
                price: productData.price,
                discount: productData.discount_percent || 0,
                inStock: productData.stock >= item.quantity,
                isActive: productData.status === 'active',
                hasStockChanged: productData.stock !== parseInt(item.stock),
                hasPriceChanged: Math.abs(oldFinalPrice - newFinalPrice) > 0.01, // ✅ SO SÁNH GIÁ BÁN
                oldFinalPrice: oldFinalPrice,
                newFinalPrice: newFinalPrice,
                priceChangeTimestamp: Date.now(),
              };
            }
          }
        } catch (error) {
          console.error(`Error checking product ${item.product_id}:`, error);
          return {
            ...item,
            isActive: false,
            hasError: true
          };
        }
        
        return item;
      });
      
      const updatedItems = await Promise.all(stockPromises);

      // ✅ SỬA THÔNG BÁO GIÁ BÁN
      const inactiveProducts = updatedItems.filter(item => !item.isActive && !item.hasError);
      const outOfStockProducts = updatedItems.filter(item => !item.inStock && item.isActive);
      const priceChangedProducts = updatedItems.filter(item => {
        // console.log(`🔍 Checking final price change for ${item.name}:`, item.hasPriceChanged);
        return item.hasPriceChanged === true;
      });

      // console.log('🔍 Final price changed products:', priceChangedProducts);

      if (inactiveProducts.length > 0) {
        message.warning(`Sản phẩm ngừng bán: ${inactiveProducts.map(p => p.name).join(', ')}`);
      }

      if (outOfStockProducts.length > 0) {
        message.warning(`Sản phẩm hết hàng: ${outOfStockProducts.map(p => `${p.name} (còn ${p.stock})`).join(', ')}`);
      }

      if (priceChangedProducts.length > 0) {
        // ✅ THÔNG BÁO GIÁ BÁN THỰC TẾ
        const priceChangeDetails = priceChangedProducts.map(p =>
          `${p.name} (${FomatVND(p.oldFinalPrice)} → ${FomatVND(p.newFinalPrice)})`
        ).join(', ');

        message.info(`Giá bán đã thay đổi: ${priceChangeDetails}`, 5);
        // console.log('✅ Final price change notification sent:', priceChangeDetails);
      }

      localStorage.setItem("cartItems", JSON.stringify(updatedItems));
      setCartItems(updatedItems);

      // ✅ DISPATCH EVENT
      window.dispatchEvent(
        new CustomEvent("cartUpdated", { detail: updatedItems })
      );

      return updatedItems;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    enabled: typeof window !== 'undefined',
    staleTime: 0, // ✅ SET 0 ĐỂ LUÔN REFETCH KHI KEY THAY ĐỔI
  });

  useEffect(() => {
    if (updatedCartData) {
      // console.log('🔄 Cart data updated from query:', updatedCartData.length, 'items');

      // ✅ TỰ ĐỘNG ẨN THÔNG BÁO GIÁ THAY ĐỔI SAU 10 GIÂY
      const priceChangedItems = updatedCartData.filter(item => item.hasPriceChanged);
      if (priceChangedItems.length > 0) {
        setTimeout(() => {
          setCartItems(prevItems =>
            prevItems.map(item => ({
              ...item,
              hasPriceChanged: false, // ✅ ẨN THÔNG BÁO
              priceChangeTimestamp: null
            }))
          );

          // ✅ CẬP NHẬT LOCALSTORAGE
          const updatedItemsWithoutNotification = updatedCartData.map(item => ({
            ...item,
            hasPriceChanged: false,
            priceChangeTimestamp: null
          }));
          localStorage.setItem("cartItems", JSON.stringify(updatedItemsWithoutNotification));

          // console.log('🔄 Price change notifications hidden after 10 seconds');
        }, 10000); // ✅ 10 GIÂY
      }
    }
  }, [updatedCartData]);

  const miniCartData = useMemo(
    () => JSON.parse(localStorage.getItem("cartItems")) || [], // Lấy dữ liệu giỏ hàng từ localStorage
    []
  );
  useEffect(() => {
    const handleCartUpdated = (e) => {
      // Cập nhật trạng thái cartItems khi nhận sự kiện
      if (e.detail) {
        setCartItems(e.detail);
      } else {
        const updatedCart = JSON.parse(localStorage.getItem("cartItems")) || [];
        setCartItems(updatedCart);
      }
    };

    // Lắng nghe sự kiện cartUpdated
    window.addEventListener("cartUpdated", handleCartUpdated);

    return () => {
      // Hủy lắng nghe sự kiện khi component bị unmount
      window.removeEventListener("cartUpdated", handleCartUpdated);
    };
  }, []);
  useEffect(() => {
    setCartItems(miniCartData); // Cập nhật trạng thái `cartItems` khi dữ liệu thay đổi
  }, [miniCartData]);

  const handleQuantityChange = (productId, variantId, delta) => {
    setCartItems((prev) => {
      const updated = prev.map((item) => {
        if (
          item.product_id === productId &&
          (!variantId || item.variant_id === variantId)
        ) {
          const newQuantity = Math.max(
            1,
            Math.min(item.quantity + delta, item.stock)
          );

          // Kiểm tra nếu vượt quá tồn kho
          if (item.quantity + delta > item.stock && canWarn) {
            if (warningCount < 3) {
              message.warning("Không thể nhập quá số lượng tồn kho!");
              setWarningCount((prevCount) => prevCount + 1);
            }

            setCanWarn(false);
            setTimeout(() => {
              setCanWarn(true);
              setWarningCount(0);
            }, 3000);
          }

          return {
            ...item,
            quantity: newQuantity,
          };
        }
        return item;
      });

      // ✅ SYNC VỚI LOCALSTORAGE
      localStorage.setItem("cartItems", JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("cartUpdated", { detail: updated }));

      return updated;
    });
  };

  const handleRemoveItem = (productId, variantId) => {
    Modal.confirm({
      title: "Xác nhận xóa sản phẩm",
      content: "Bạn có chắc muốn xóa sản phẩm này?",
      cancelText: "Hủy",
      onOk: () => {
        const updatedCartItems = cartItems.filter(
          (item) =>
            item.product_id !== productId ||
            (variantId && item.variant_id !== variantId) // Loại bỏ sản phẩm khỏi danh sách
        );
        setCartItems(updatedCartItems); // Cập nhật trạng thái giỏ hàng
        setSelectedItems(
          selectedItems.filter(
            (itemId) =>
              itemId.product_id !== productId ||
              (variantId && itemId.variant_id !== variantId) // Loại bỏ sản phẩm khỏi danh sách đã chọn
          )
        );
        localStorage.setItem("cartItems", JSON.stringify(updatedCartItems)); // Lưu lại giỏ hàng vào localStorage
        window.dispatchEvent(
          new CustomEvent("cartUpdated", { detail: updatedCartItems })
        ); // Phát sự kiện để đồng bộ
      },
    });
  };

  const handleSelectItem = (productId, variantId) => {
    const itemKey = { product_id: productId, variant_id: variantId };
    const isSelected = selectedItems.some(
      (item) =>
        item.product_id === productId &&
        (!variantId || item.variant_id === variantId) // Kiểm tra xem sản phẩm đã được chọn chưa
    );
    setSelectedItems(
      (prev) =>
        isSelected
          ? prev.filter(
              (item) =>
                item.product_id !== productId ||
                (variantId && item.variant_id !== variantId) // Bỏ chọn sản phẩm
            )
          : [...prev, itemKey] // Thêm sản phẩm vào danh sách đã chọn
    );
  };

  const handleSelectAll = () => {
    const validItems = cartItems
      .filter(item => item.isActive && !item.hasError) // ✅ CHỈ LẤY SẢN PHẨM HỢP LỆ
      .map((item) => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
      }));

    setSelectedItems(
      selectedItems.length === validItems.length ? [] : validItems
    );
  };

  const calculateSubtotal = () => {
    return cartItems
      .filter((item) =>
        selectedItems.some(
          (selected) =>
            selected.product_id === item.product_id &&
            (!item.variant_id || selected.variant_id === item.variant_id)
        )
      )
      .reduce(
        (total, item) =>
          total +
          (item.price - (item.price * item.discount) / 100) * item.quantity,
        0
      )
      .toFixed(2); // Làm tròn đến 2 chữ số thập phân
  };

  const handleCheckout = () => {
    const selectedCartItems = cartItems.filter((item) =>
      selectedItems.some(
        (selected) =>
          selected.product_id === item.product_id &&
          (!item.variant_id || selected.variant_id === item.variant_id)
      )
    );

    // ✅ KIỂM TRA SẢN PHẨM KHÔNG HỢP LỆ
    const invalidItems = selectedCartItems.filter(item =>
      !item.isActive || !item.inStock || item.hasError
    );

    if (invalidItems.length > 0) {
      message.error("Có sản phẩm không hợp lệ trong giỏ hàng. Vui lòng kiểm tra lại!");
      return;
    }

    const validCartItems = selectedCartItems.filter(item =>
      item.isActive && item.inStock && !item.hasError
    );

    if (validCartItems.length === 0) {
      message.error("Vui lòng chọn ít nhất một sản phẩm để đặt hàng!");
      return;
    }

    setCheckoutItems(validCartItems);
    localStorage.setItem("checkoutItems", JSON.stringify(validCartItems));
    nav("/checkout");
  };

  const columns = [
    {
      title: (
        <Checkbox
          checked={
            selectedItems.length === cartItems.filter(item => item.isActive && !item.hasError).length &&
            cartItems.filter(item => item.isActive && !item.hasError).length > 0
          }
          onChange={handleSelectAll}
        />
      ),
      dataIndex: "checkbox",
      render: (_, record) => (
        <Checkbox
          checked={selectedItems.some(
            (selected) =>
              selected.product_id === record.product_id &&
              (!record.variant_id || selected.variant_id === record.variant_id)
          )}
          disabled={!record.isActive || record.hasError} // ✅ DISABLE NẾU NGỪNG BÁN
          onChange={() =>
            handleSelectItem(record.product_id, record.variant_id)
          }
        />
      ),
    },
    {
      title: "Hình ảnh",
      dataIndex: "image",
      render: (image) => (
        <Image
          width={80}
          height={100}
          className="object-cover"
          src={`http://127.0.0.1:8000/storage/${image}`}
        />
      ),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      render: (_, item) => (
        <>
          <div className={!item.isActive ? 'text-gray-400 line-through' : ''}>
            {item.name}
            {!item.isActive && (
              <div className="text-xs text-red-500 mt-1">
                <i className="fas fa-ban mr-1"></i>
                Ngừng bán
              </div>
            )}
            {!item.inStock && item.isActive && (
              <div className="text-xs text-yellow-600 mt-1">
                <i className="fas fa-exclamation-triangle mr-1"></i>
                Hết hàng (còn {item.stock})
              </div>
            )}
            {/* ✅ HIỂN THỊ GIÁ BÁN THAY ĐỔI VỚI ANIMATION */}
            {item.hasPriceChanged && (
              <div className="text-xs text-blue-500 mt-1 animate-pulse">
                <i className="fas fa-info-circle mr-1"></i>
                Giá bán đã cập nhật: {item.oldFinalPrice && item.newFinalPrice ?
                  `${FomatVND(item.oldFinalPrice)} → ${FomatVND(item.newFinalPrice)}` :
                  'Giá bán đã thay đổi'
                }
              </div>
            )}
          </div>
          <div>
            {item?.thuoc_tinh?.map((value) => (
              <div key={value}>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {value}
                </Text>
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      render: (_, item) =>
        FomatVND(
          parseFloat(item.price) -
            (parseFloat(item.discount) * parseFloat(item.price)) / 100
        ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      render: (_, item) => (
        <div className={`flex items-center border border-gray-300 rounded-lg px-3 py-2 space-x-4 w-fit ${!item.isActive ? 'opacity-50' : ''}`}>
          <button
            onClick={() =>
              handleQuantityChange(item.product_id, item.variant_id, -1)
            }
            className="text-gray-600"
            disabled={!item.isActive || item.hasError} // ✅ DISABLE NẾU NGỪNG BÁN
          >
            <i className="fa-solid fa-minus"></i>
          </button>
          <input
            type="text"
            value={item.quantity}
            min={1}
            max={item.stock}
            onChange={(e) => {
              if (!item.isActive || item.hasError) return; // ✅ KHÔNG CHO THAY ĐỔI NẾU NGỪNG BÁN

              let value = parseInt(e.target.value, 10);
              if (isNaN(value) || value < 1) value = 1;
              if (value > item.stock) {
                if (canWarn) {
                  if (warningCount < 3) {
                    message.warning("Không thể nhập quá số lượng tồn kho!");
                    setWarningCount((prevCount) => prevCount + 1);
                  }
                  setCanWarn(false);
                  setTimeout(() => {
                    setCanWarn(true);
                    setWarningCount(0);
                  }, 3000);
                }
                value = item.stock;
              }
              handleQuantityChange(
                item.product_id,
                item.variant_id,
                value - item.quantity
              );
            }}
            className={`text-center ${!item.isActive ? 'bg-gray-100 text-gray-400' : ''}`}
            disabled={!item.isActive || item.hasError} // ✅ DISABLE INPUT
            style={{
              width: `${item.quantity?.toString().length + 1}ch`,
            }}
          />
          <button
            onClick={() =>
              handleQuantityChange(item.product_id, item.variant_id, 1)
            }
            className="text-gray-600"
            disabled={!item.isActive || item.hasError} // ✅ DISABLE NẾU NGỪNG BÁN
          >
            <i className="fa-solid fa-plus"></i>
          </button>
        </div>
      ),
    },
    {
      title: "Thành tiền",
      dataIndex: "total",
      render: (_, item) =>
        FomatVND(
          parseFloat(
            (parseFloat(item.price) -
              (parseFloat(item.discount) * parseFloat(item.price)) / 100) *
              item.quantity
          ).toFixed(0)
        ),
    },
    {
      title: "Xóa",
      dataIndex: "remove",
      render: (_, item) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(item.product_id, item.variant_id)}
        >
          Xóa
        </Button>
      ),
    },
  ];

  return (
    <div style={{ background: "#f5f5f5", padding: "2rem" }}>
      <div style={{ background: "#fff", padding: "2rem", borderRadius: 8 }}>
        <Title level={3}>GIỎ HÀNG</Title>
        <Table
          dataSource={cartItems} // Dữ liệu giỏ hàng
          columns={columns} // Cấu hình cột
          rowKey={
            (record) => `${record.product_id}_${record.variant_id || "default"}` // Khóa duy nhất cho mỗi hàng
          }
          pagination={false} // Không sử dụng phân trang
        />
        <Row justify="end" style={{ marginTop: "2rem" }}>
          <Col>
            <Space direction="vertical">
              <Text strong>
                Tổng tiền:{" "}
                <Text type="danger" strong>
                  {FomatVND(calculateSubtotal())} {/* Hiển thị tổng tiền */}
                </Text>
              </Text>
              <Space>
                <Button
                  onClick={() => nav("/shop")}
                  className="border hover:!border-gray-800 hover:!text-gray-800"
                >
                  Tiếp tục mua hàng
                </Button>
                <Button
                  type="primary"
                  disabled={selectedItems.length === 0} // Vô hiệu hóa nếu không có sản phẩm nào được chọn
                  onClick={handleCheckout} // Xử lý thanh toán
                  className="bg-black hover:!bg-gray-700 px-6 py-2"
                >
                  Đặt hàng
                </Button>
              </Space>
            </Space>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Cart;