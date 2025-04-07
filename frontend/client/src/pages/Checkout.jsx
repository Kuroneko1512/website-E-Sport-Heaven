import { DeleteOutlined } from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Col,
  Image,
  Modal,
  Row,
  Space,
  Table,
  Typography
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FomatVND from "../utils/FomatVND";

const { Title, Text } = Typography;

const Cart = () => {
  const [cartItems, setCartItems] = useState([]); // Lưu trữ danh sách sản phẩm trong giỏ hàng
const [selectedItems, setSelectedItems] = useState([]); // Lưu trữ danh sách sản phẩm được chọn
const [checkoutItems, setCheckoutItems] = useState([]); // Lưu trữ danh sách sản phẩm để thanh toán
const nav = useNavigate(); // Điều hướng giữa các trang

  const miniCartData = useMemo(
    () => JSON.parse(localStorage.getItem("cartItems")) || [],// Lấy dữ liệu giỏ hàng từ localStorage
    []
  );

  useEffect(() => {
    setCartItems(miniCartData);// Cập nhật trạng thái `cartItems` khi dữ liệu thay đổi
  }, [miniCartData]);

  const handleQuantityChange = (productId, variantId, delta) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.product_id === productId &&
        (!variantId || item.variant_id === variantId) // Kiểm tra sản phẩm và biến thể
          ? {
              ...item,
              quantity: Math.max(
                1,// Đảm bảo số lượng không nhỏ hơn 1
                Math.min(item.quantity + delta, item.stock)// Đảm bảo số lượng không vượt quá tồn kho
              ),
            }
          : item
      )
    );
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
            (variantId && item.variant_id !== variantId)// Loại bỏ sản phẩm khỏi danh sách
        );
        setCartItems(updatedCartItems);// Cập nhật trạng thái giỏ hàng
        setSelectedItems(
          selectedItems.filter(
            (itemId) =>
              itemId.product_id !== productId ||
              (variantId && itemId.variant_id !== variantId)// Loại bỏ sản phẩm khỏi danh sách đã chọn
          )
        );
        localStorage.setItem("cartItems", JSON.stringify(updatedCartItems));// Lưu lại giỏ hàng vào localStorage
      },
    });
  };

  const handleSelectItem = (productId, variantId) => {
    const itemKey = { product_id: productId, variant_id: variantId };
    const isSelected = selectedItems.some(
      (item) =>
        item.product_id === productId &&
        (!variantId || item.variant_id === variantId)// Kiểm tra xem sản phẩm đã được chọn chưa
    );
    setSelectedItems((prev) =>
      isSelected
        ? prev.filter(
            (item) =>
              item.product_id !== productId ||
              (variantId && item.variant_id !== variantId)// Bỏ chọn sản phẩm
          )
        : [...prev, itemKey]// Thêm sản phẩm vào danh sách đã chọn
    );
  };

  const handleSelectAll = () => {
    const allItems = cartItems.map((item) => ({
      product_id: item.product_id,
      variant_id: item.variant_id,
    }));
    setSelectedItems((prev) =>
      prev.length === allItems.length ? [] : allItems// Nếu tất cả đã được chọn, bỏ chọn tất cả; ngược lại, chọn tất cả
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
      .reduce((total, item) => total + (item.price - (item.price * item.discount / 100)) * item.quantity, 0)
      .toFixed(2);// Làm tròn đến 2 chữ số thập phân
  };

  const handleCheckout = () => {
    const selectedCartItems = cartItems
      .filter((item) =>
        selectedItems.some(
          (selected) =>
            selected.product_id === item.product_id &&
            (!item.variant_id || selected.variant_id === item.variant_id)// Lọc các sản phẩm đã chọn
        )
      )
      .map((item) => ({
        ...item,
        price: item.price,
        discount: item.discount,
      }));
  
    setCheckoutItems(selectedCartItems);// Lưu danh sách sản phẩm để thanh toán
    localStorage.setItem("checkoutItems", JSON.stringify(selectedCartItems));// Lưu vào localStorage
    nav("/newcheckout");// Điều hướng đến trang thanh toán
  };

  const columns = [
    {
      title: (
        <Checkbox
          checked={selectedItems.length === cartItems.length}
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
          onChange={() =>
            handleSelectItem(record.product_id, record.variant_id)
          }
        />
      ),
    },
    {
      title: "Hình ảnh",
      dataIndex: "image",
      render: (image) => <Image width={80} height={100} className="object-cover" src={`http://127.0.0.1:8000/storage/${image}`} />,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      render: (_, item) => (
        <>
          <div>{item.name}</div>
          <div>
            {Object.entries(item.thuoc_tinh || {}).map(([key, value]) => (
              <div key={key}>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {key}: {value}
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
        <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 space-x-4 w-fit">
          <button
            onClick={() =>
              handleQuantityChange(item.product_id, item.variant_id, -1)
            }
            className="text-gray-600"
          >
            <i className="fa-solid fa-minus"></i>
          </button>
          <input
            type="text"
            value={item.quantity}
            min={1}
            max={item.stock}
            onChange={(e) => {
              let value = parseInt(e.target.value, 10);
              if (isNaN(value) || value < 1) value = 1;
              if (value > item.stock) value = item.stock;
              handleQuantityChange(
                item.product_id,
                item.variant_id,
                value - item.quantity
              );
            }}
            className="text-center"
            style={{
              width: `${item.quantity.toString().length + 1}ch`,
            }}
          />
          <button
            onClick={() =>
              handleQuantityChange(item.product_id, item.variant_id, 1)
            }
            className="text-gray-600"
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
          dataSource={cartItems}// Dữ liệu giỏ hàng
          columns={columns}// Cấu hình cột
          rowKey={(record) =>
            `${record.product_id}_${record.variant_id || "default"}`// Khóa duy nhất cho mỗi hàng
          }
          pagination={false}// Không sử dụng phân trang
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
                <Button onClick={() => nav("/shop")} className="border hover:!border-gray-800 hover:!text-gray-800">
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