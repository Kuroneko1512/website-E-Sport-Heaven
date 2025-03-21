import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Checkbox,
  Button,
  InputNumber,
  Image,
  Modal,
  Typography,
  Row,
  Col,
  Space,
  Input,
} from "antd";
import { DeleteOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import instanceAxios from "../config/db";
import FomatVND from "../utils/FomatVND";

const { Title, Text } = Typography;

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const nav = useNavigate();

  const miniCartData = useMemo(
    () => JSON.parse(localStorage.getItem("cartItems")) || [],
    []
  );

  useEffect(() => {
    setCartItems(miniCartData);
  }, [miniCartData]);

  const handleQuantityChange = (productId, variantId, delta) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.product_id === productId &&
        (!variantId || item.variant_id === variantId)
          ? {
              ...item,
              quantity: Math.max(
                1,
                Math.min(item.quantity + delta, item.stock)
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
      onOk: () => {
        const updatedCartItems = cartItems.filter(
          (item) =>
            item.product_id !== productId ||
            (variantId && item.variant_id !== variantId)
        );
        setCartItems(updatedCartItems);
        setSelectedItems(
          selectedItems.filter(
            (itemId) =>
              itemId.product_id !== productId ||
              (variantId && itemId.variant_id !== variantId)
          )
        );
        localStorage.setItem("cartItems", JSON.stringify(updatedCartItems));
      },
    });
  };

  const handleSelectItem = (productId, variantId) => {
    const itemKey = { product_id: productId, variant_id: variantId };
    const isSelected = selectedItems.some(
      (item) =>
        item.product_id === productId &&
        (!variantId || item.variant_id === variantId)
    );
    setSelectedItems((prev) =>
      isSelected
        ? prev.filter(
            (item) =>
              item.product_id !== productId ||
              (variantId && item.variant_id !== variantId)
          )
        : [...prev, itemKey]
    );
  };

  const handleSelectAll = () => {
    const allItems = cartItems.map((item) => ({
      product_id: item.product_id,
      variant_id: item.variant_id,
    }));
    setSelectedItems((prev) =>
      prev.length === allItems.length ? [] : allItems
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
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  const handleCheckout = () => {
    const selectedCartItems = cartItems.filter((item) =>
      selectedItems.some(
        (selected) =>
          selected.product_id === item.product_id &&
          (!item.variant_id || selected.variant_id === item.variant_id)
      )
    );
    setCheckoutItems(selectedCartItems);
    localStorage.setItem("checkoutItems", JSON.stringify(selectedCartItems));
    nav("/newcheckout");
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
      render: (image) => <Image width={80} src={image} />,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      render: (_, item) => (
        <>
          <div>{item.name}</div>
          <div>Size: {item.variant_id}</div>
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
          dataSource={cartItems}
          columns={columns}
          rowKey={(record) =>
            `${record.product_id}_${record.variant_id || "default"}`
          }
          pagination={false}
        />
        <Row justify="end" style={{ marginTop: "2rem" }}>
          <Col>
            <Space direction="vertical">
              <Text strong>
                Tổng tiền:{" "}
                <Text type="danger" strong>
                  {FomatVND(calculateSubtotal())}
                </Text>
              </Text>
              <Space>
                <Button onClick={() => nav("/shop")} className="border hover:!border-gray-800 hover:!text-gray-800">
                  Tiếp tục mua hàng
                </Button>
                <Button
                  type="primary"
                  disabled={selectedItems.length === 0}
                  onClick={handleCheckout}
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

export default Checkout;
