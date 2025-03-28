import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FomatVND from "../utils/FomatVND";
import {
  Form,
  Input,
  Select,
  Button,
  Radio,
  Typography,
  Divider,
  Card,
  List,
  message,
  Modal,
} from "antd";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;
const { Option } = Select;

const NewCheckout = () => {
  const isLogin = useSelector((state) => state.auth.isLogin);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [form] = Form.useForm();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [discountCode, setDiscountCode] = useState("");
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [order, setOrder] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [submit, setSubmit] = useState(false);

  // useEffect(() => {
  //   axios.get('https://provinces.open-api.vn/api/p/')
  //     .then(response => setProvinces(response.data))
  //     .catch(error => console.error('Lỗi khi tải tỉnh/thành phố:', error));

  //   const cartItems = localStorage.getItem('checkoutItems');
  //   const cartTotal = localStorage.getItem('cartTotal');

  //   if (cartItems) setCartItems(JSON.parse(cartItems));
  //   if (cartTotal) setCartTotal(JSON.parse(cartTotal));
  // }, []);

  // useEffect(() => {
  //   if (selectedProvince) {
  //     axios.get(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
  //       .then(response => setDistricts(response.data.districts))
  //       .catch(error => console.error('Lỗi khi tải quận/huyện:', error));
  //   }
  // }, [selectedProvince]);

  // useEffect(() => {
  //   if (selectedDistrict) {
  //     axios.get(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
  //       .then(response => setWards(response.data.wards))
  //       .catch(error => console.error('Lỗi khi tải phường/xã:', error));
  //   }
  // }, [selectedDistrict]);

  const handleSelectAddress = (id) => {
    if (id) setSelectedAddress(id);
  };

  useEffect(() => {
    if (isLogin) {
      const savedAddresses =
        JSON.parse(localStorage.getItem("addresses")) || [];
      setAddresses(savedAddresses);
      const defaultAddr = savedAddresses.find((addr) => addr.defaultAddress);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr.id);
      }
    }
  }, [isLogin]);

  useEffect(() => {
    const loadData = async () => {
      const provincesData = await fetch("/data/provinces.json").then((res) =>
        res.json()
      );
      const districtsData = await fetch("/data/districts.json").then((res) =>
        res.json()
      );
      const wardsData = await fetch("/data/wards.json").then((res) =>
        res.json()
      );

      setProvinces(provincesData);
      setDistricts(districtsData);
      setWards(wardsData);
    };

    loadData();
    const cartItems = localStorage.getItem("checkoutItems");
    const cartTotal = localStorage.getItem("cartTotal");

    if (cartItems) setCartItems(JSON.parse(cartItems));
    if (cartTotal) setCartTotal(JSON.parse(cartTotal));
  }, [selectedProvince, selectedDistrict, selectedWard]);

  // const handleDeleteAddress = (id) => {
  //   Modal.confirm({
  //     title: "Xác nhận xóa địa chỉ",
  //     content: "Bạn có chắc muốn xóa địa chỉ này?",
  //     cancelText: "Hủy",
  //     onOk: () => {
  //       const updated = addresses.filter((addr) => addr.id !== id);
  //       setAddresses(updated);
  //       localStorage.setItem("addresses", JSON.stringify(updated));

  //       // Nếu địa chỉ bị xóa là địa chỉ đang chọn, đặt lại selectedAddress
  //       if (selectedAddress === id) {
  //         setSelectedAddress(updated.length > 0 ? updated[0].id : null);
  //       }

  //       message.success("Đã xóa địa chỉ");
  //     },
  //   });
  // };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setOrder((prev) => ({ ...prev, [id]: value }));
  };

  console.log("order", order);

  const calculateGrandTotal = () => {
    const subtotal = cartItems.reduce(
      (total, item) =>
        total +
        (item.price - (item.price * item.discount) / 100) * item.quantity,
      0
    );
    const shippingFee = 5000;
    const discount = discountCode ? 10000 : 0;
    return subtotal + shippingFee - discount;
  };

  const handleApplyDiscount = () => {
    message.info("Mã giảm giá chưa được hỗ trợ!");
  };

  const handleSubmit = async () => {
    setSubmit(true);
    const shippingAddressParts = [
      wards.find((w) => parseFloat(w.code) === parseFloat(selectedWard))?.name,
      districts.find((d) => parseFloat(d.code) === parseFloat(selectedDistrict))
        ?.name,
      provinces.find((p) => parseFloat(p.code) === parseFloat(selectedProvince))
        ?.name,
    ]
      .filter(Boolean)
      .join(", ");

    if (
      !order.customer_name ||
      !order.customer_phone ||
      !order.customer_email ||
      !shippingAddressParts
    ) {
      message.error("Vui lòng điền đầy đủ thông tin!");
      setSubmit(false);
      return;
    }

    const orderData = {
      ...order,
      shipping_address: shippingAddressParts,
      amount: calculateGrandTotal(),
      order_items: cartItems.map((item) => ({
        product_id: item.product_id,
        product_variant_id: item.variant_id || null,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
      })),
      payment_method: paymentMethod,
    };

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/v1/order",
        orderData
      );
      if (paymentMethod === "vnpay" && response.data.vnpUrl) {
        window.location.href = response.data.vnpUrl;
      } else {
        message.success("Đặt hàng thành công!");
        localStorage.setItem("orderCode", response.data.data.order_code);
        let checkoutItems =
          JSON.parse(localStorage.getItem("checkoutItems")) || [];
        let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

        // Lọc các item trong cartItems, giữ lại những item không trùng với checkoutItems
        cartItems = cartItems.filter(
          (item) =>
            !checkoutItems.some((checkoutItem) => checkoutItem.id === item.id)
        );

        // Cập nhật lại localStorage sau khi đã loại bỏ các item trùng
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
        setCartItems([]);
        setCartTotal(0);
        setOrder({
          customer_name: "",
          customer_email: "",
          customer_phone: "",
          shipping_address: "",
          order_items: [],
        });
        navigate("/thankyou");
      }
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      message.error("Có lỗi xảy ra, vui lòng thử lại!");
    }
    setSubmit(false);
  };

  const dataform = addresses.find((addr) => addr.id === selectedAddress);

  // console.log("email:",dataform?.email);

  useEffect(() => {
    // setDefaultAddr(dataform);
    if (dataform) {
      form.setFieldsValue({
        fullname: dataform?.fullname,
        mobile: dataform?.mobile,
        email: dataform?.email,
        specificAddress: dataform?.specificAddress,
        ward: dataform?.ward,
        district: dataform?.district,
        province: dataform?.province,
      });
      setSelectedProvince(
        provinces?.find((p) => p.name === dataform.province)?.code || ""
      );
      setSelectedDistrict(
        districts?.find((d) => d.name === dataform.district)?.code || ""
      );
      setSelectedWard(wards?.find((w) => w.name === dataform.ward)?.code || "");

      setOrder((prev) => ({
        ...prev,
        customer_name: dataform?.fullname,
        customer_phone: dataform?.mobile,
        customer_email: dataform?.email,
        shipping_address:
          dataform?.specificAddress +
          ", " +
          dataform?.ward +
          ", " +
          dataform?.district +
          ", " +
          dataform?.province,
        order_items: cartItems?.map((item) => ({
          product_id: item.product_id,
          product_variant_id: item.variant_id || null,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
        })),
      }));
    }
  }, [selectedAddress, addresses]);

  return (
    <div className="p-6 bg-white">
      <Title level={2}>Thanh toán</Title>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <div className="mb-4">
            <Text strong>Địa chỉ giao hàng:</Text>{" "}
            {dataform
              ? `${dataform?.fullname} - ${dataform?.mobile} - ${dataform?.specificAddress}, ${dataform?.ward}, ${dataform?.district}, ${dataform?.province}`
              : "Chưa có địa chỉ"}
            {isLogin && addresses.length > 0 && (
              <Button type="link" onClick={() => setShowAddressModal(true)}>
                Thay đổi
              </Button>
            )}
          </div>

          <Card
            title={isLogin && addresses.length > 0 ? "Địa chi" : "Địa chỉ mới"}
          >
            <Form layout="vertical" form={form}>
              <Form.Item label="Tên" name={"fullname"} required>
                <Input
                  id="customer_name"
                  value={order.customer_name}
                  onChange={handleInputChange}
                  disabled={dataform?.fullname}
                  className="!bg-white !border !border-gray-300 !text-black"
                />
              </Form.Item>
              <Form.Item label="Số điện thoại" name={"mobile"} required>
                <Input
                  id="customer_phone"
                  value={order.customer_phone}
                  onChange={handleInputChange}
                  disabled={dataform?.mobile}
                  className="!bg-white !border !border-gray-300 !text-black"
                />
              </Form.Item>
              <Form.Item label="Email" name={"email"} required>
                <Input
                  id="customer_email"
                  value={order.customer_email}
                  onChange={handleInputChange}
                  disabled={dataform?.email}
                  className="!bg-white !border !border-gray-300 !text-black"
                />
              </Form.Item>

              <Form.Item
                label="Tỉnh/Thành phố"
                name="province"
                rules={[
                  { required: true, message: "Vui lòng chọn tỉnh/thành phố" },
                ]}
              >
                {dataform?.province ? (
                  <Input
                    value={dataform?.province}
                    disabled
                    className="!bg-white !border !border-gray-300 !text-black"
                  />
                ) : (
                  <Select
                    placeholder="Chọn Tỉnh/Thành phố"
                    value={selectedProvince}
                    onChange={(value) => {
                      setSelectedProvince(value);
                      setDistricts([]);
                      setWards([]);
                      setSelectedDistrict("");
                      setSelectedWard("");
                    }}
                    disabled={dataform?.province}
                  >
                    {provinces?.map((province) => (
                      <Option key={province.code} value={province.code}>
                        {province.name}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
              <Form.Item
                label="Quận/Huyện"
                name="district"
                rules={[
                  { required: true, message: "Vui lòng chọn quận/huyện" },
                ]}
              >
                {dataform?.district ? (
                  <Input
                    value={dataform?.district}
                    disabled
                    className="!bg-white !border !border-gray-300 !text-black"
                  />
                ) : (
                  <Select
                    placeholder="Chọn Quận/Huyện"
                    value={selectedDistrict}
                    onChange={(value) => {
                      setSelectedDistrict(value);
                      setWards([]);
                      setSelectedWard("");
                    }}
                    disabled={!selectedProvince}
                  >
                    {districts?.map((d) => (
                      <Option key={d.code} value={d.code}>
                        {d.name}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
              <Form.Item
                label="Phường/Xã"
                name="ward"
                rules={[{ required: true, message: "Vui lòng chọn phường/xã" }]}
              >
                {dataform?.ward ? (
                  <Input
                    value={dataform?.ward}
                    disabled
                    className="!bg-white !border !border-gray-300 !text-black"
                  />
                ) : (
                  <Select
                    placeholder="Chọn Phường/Xã"
                    value={selectedWard}
                    onChange={setSelectedWard}
                    disabled={!selectedDistrict}
                  >
                    {wards?.map((w) => (
                      <Option key={w.code} value={w.code}>
                        {w.name}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
              <Form.Item
                label="Địa chỉ cụ thể"
                name={"specificAddress"}
                required
              >
                <Input
                  value={order?.specificAddress}
                  onChange={(e) =>
                    setOrder({ ...order, specificAddress: e.target.value })
                  }
                  className="!bg-white !border !border-gray-300 !text-black"
                  disabled={dataform?.specificAddress}
                />
              </Form.Item>
            </Form>
          </Card>
        </div>

        <div>
          <Card title="Thông tin đơn hàng">
            <List
              dataSource={cartItems}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={`${item.name} (x${item.quantity})`}
                    description={`SKU: ${item.sku}`}
                  />
                  <Text>
                    {FomatVND(
                      (item.price - (item.price * item.discount) / 100) *
                        item.quantity
                    )}
                  </Text>
                </List.Item>
              )}
            />

            <Divider />

            <Input
              placeholder="Nhập mã giảm giá"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              addonAfter={
                <Button onClick={handleApplyDiscount}>Áp dụng</Button>
              }
            />

            <Divider />

            <Radio.Group
              onChange={(e) => setPaymentMethod(e.target.value)}
              value={paymentMethod}
            >
              <Radio value="cod">Thanh toán khi nhận hàng (COD)</Radio>
              <Radio value="vnpay">Thanh toán qua VNPay</Radio>
            </Radio.Group>

            <Divider />

            <div className="flex justify-between mb-2">
              <Text>Phí vận chuyển</Text>
              <Text>{FomatVND(5000)}</Text>
            </div>
            <div className="flex justify-between font-bold">
              <Text strong>Tổng cộng</Text>
              <Text strong>{FomatVND(calculateGrandTotal())}</Text>
            </div>

            <Button
              type="primary"
              block
              className="mt-4"
              onClick={handleSubmit}
              disabled={submit || (order && order?.order_items?.length === 0)}
            >
              Tiếp tục thanh toán
            </Button>
          </Card>
        </div>
      </div>

      <Modal
        open={showAddressModal}
        onCancel={() => setShowAddressModal(false)}
        footer={null}
        title="Chọn địa chỉ giao hàng"
      >
        {addresses.map((addr) => (
          <Card key={addr.id} className="mb-2">
            <div className="flex justify-between">
              <div>
                <p>
                  {addr.fullname} - {addr.mobile}
                </p>
                <p>
                  {addr.specificAddress}, {addr.ward}, {addr.district},{" "}
                  {addr.province}
                </p>
              </div>
              <div className="flex items-center">
                <Button
                  type="link"
                  onClick={() => handleSelectAddress(addr.id)}
                >
                  Chọn
                </Button>
                {/* <Button danger onClick={() => handleDeleteAddress(addr.id)}>
                  Xóa
                </Button> */}
              </div>
            </div>
          </Card>
        ))}
      </Modal>
    </div>
  );
};

export default NewCheckout;