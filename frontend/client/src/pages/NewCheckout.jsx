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
import Cookies from "js-cookie";

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
  const [specificAddress, setSpecificAddress] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [order, setOrder] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [submit, setSubmit] = useState(false);
  // console.log("User:", user);

  // console.log("order", order);
  // Load dữ liệu provinces, districts, wards một lần khi mount
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/v1/address/provinces/')
      .then(response => setProvinces(response?.data?.data))
      .catch(error => console.error('Lỗi khi tải tỉnh/thành phố:', error));

    const cartItems = localStorage.getItem('checkoutItems');
    const cartTotal = localStorage.getItem('cartTotal');

    if (cartItems) setCartItems(JSON.parse(cartItems));
    if (cartTotal) setCartTotal(JSON.parse(cartTotal));
  }, []);

  console.log("provinces", provinces);
  console.log("districts", districts);
  console.log("wards", wards);

  useEffect(() => {
    if (selectedProvince) {
      axios.get(`http://127.0.0.1:8000/api/v1/address/districts?province_code=${selectedProvince}`)
        .then(response => setDistricts(response?.data?.data))
        .catch(error => console.error('Lỗi khi tải quận/huyện:', error));
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      axios.get(`http://127.0.0.1:8000/api/v1/address/communes?district_code=${selectedDistrict}`)
        .then(response => setWards(response?.data?.data))
        .catch(error => console.error('Lỗi khi tải phường/xã:', error));
    }
  }, [selectedDistrict]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setOrder((prev) => ({ ...prev, [id]: value }));
  };

  // Khi đăng nhập, load địa chỉ từ localStorage
  useEffect(() => {
    const userRaw = Cookies.get("user");
    if (!userRaw) return;

  const user = JSON.parse(userRaw);
    if (isLogin) {
      setOrder((prev) => ({
        ...prev,
        customer_id: user.customerId || null,
      }));
      const savedAddresses =
        JSON.parse(localStorage.getItem("addresses")) || [];
      setAddresses(savedAddresses);
      if (savedAddresses.length > 0) {
        const defaultAddr = savedAddresses.find((addr) => addr.defaultAddress);
        setSelectedAddress(defaultAddr ? defaultAddr.id : savedAddresses[0].id);
        setUseNewAddress(false);
      } else {
        setUseNewAddress(true);
      }
    } else {
      setUseNewAddress(true);
    }
  }, [isLogin]);

  // Cập nhật form và order khi có địa chỉ đã lưu được chọn
  const dataform = addresses.find((addr) => addr.id === selectedAddress);
  useEffect(() => {
    if (dataform) {
      // Đang dùng địa chỉ đã lưu => disabled các trường nhập
      form.setFieldsValue({
        fullname: dataform.fullname,
        mobile: dataform.mobile,
        email: dataform.email,
        specificAddress: dataform.specificAddress,
        province: dataform.province,
        district: dataform.district,
        ward: dataform.ward,
      });
      // Tìm mã code từ dữ liệu đã load
      const provinceCode =
        provinces.find((p) => p.name === dataform.province)?.code || "";
      const districtCode =
        districts.find((d) => d.name === dataform.district)?.code || "";
      const wardCode = wards.find((w) => w.name === dataform.ward)?.code || "";

      setSelectedProvince(provinceCode);
      setSelectedDistrict(districtCode);
      setSelectedWard(wardCode);

      setOrder((prev) => ({
        ...prev,
        customer_name: dataform.fullname,
        customer_phone: dataform.mobile,
        customer_email: dataform.email,
        shipping_address:
          dataform.specificAddress +
          ", " +
          dataform.ward +
          ", " +
          dataform.district +
          ", " +
          dataform.province,
        order_items: cartItems.map((item) => ({
          product_id: item.product_id,
          product_variant_id: item.variant_id || null,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
        })),
      }));
    } else {
      // Nếu không có địa chỉ lưu, cho phép nhập mới
      setUseNewAddress(true);
      // Nếu có dữ liệu từ form nhập mới, cập nhật order
      const shippingAddress =
        specificAddress +
        ", " +
        (wards.find((w) => w.code === selectedWard)?.name || "") +
        ", " +
        (districts.find((d) => d.code === selectedDistrict)?.name || "") +
        ", " +
        (provinces.find((p) => p.code === selectedProvince)?.name || "");
      setOrder((prev) => ({
        ...prev,
        shipping_address: shippingAddress,
        order_items: cartItems.map((item) => ({
          product_id: item.product_id,
          product_variant_id: item.variant_id || null,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
        })),
      }));
    }
  }, [
    selectedAddress,
    addresses,
    specificAddress,
    selectedProvince,
    selectedDistrict,
    selectedWard,
    form,
    cartItems,
    provinces,
    districts,
    wards,
  ]);

  // Xử lý chọn địa chỉ từ modal
  const handleSelectAddress = (id) => {
    setSelectedAddress(id);
    setShowAddressModal(false);
    setUseNewAddress(false);
  };

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

  // Xử lý submit đơn hàng
  const handleSubmit = async () => {
    try {
      // Dùng validateFields của form nếu dùng nhập mới
      if (useNewAddress) {
        await form.validateFields();
      }
      // Kiểm tra thông tin bắt buộc
      if (
        !order.customer_name ||
        !order.customer_phone ||
        !order.customer_email ||
        !order.shipping_address
      ) {
        message.error("Vui lòng điền đầy đủ thông tin!");
        return;
      }
      setSubmit(true);
      const orderData = {
        ...order,
        amount: calculateGrandTotal(),
        payment_method: paymentMethod,
      };
      const response = await axios.post(
        "http://127.0.0.1:8000/api/v1/order",
        orderData
      );
      if (paymentMethod === "vnpay" && response.data.vnpUrl) {
        window.location.href = response.data.vnpUrl;
      } else {
        message.success("Đặt hàng thành công!");
        localStorage.setItem("orderCode", response.data.data.order_code);
        // Xử lý cập nhật lại giỏ hàng
        const checkoutItems =
          JSON.parse(localStorage.getItem("checkoutItems")) || [];
        let storedCartItems =
          JSON.parse(localStorage.getItem("cartItems")) || [];
        storedCartItems = storedCartItems.filter(
          (item) =>
            !checkoutItems.some((checkoutItem) => checkoutItem.id === item.id)
        );
        localStorage.setItem("cartItems", JSON.stringify(storedCartItems));
        setCartItems([]);
        setCartTotal(0);
        setOrder({});
        navigate("/thankyou");
      }
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      message.error("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setSubmit(false);
    }
  };

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
                    // setOrder({ ...order, specificAddress: e.target.value })
                    setSpecificAddress(e.target.value)
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
                    description={<>
                      <div>SKU: {item.sku}</div>
                      {Object.entries(item.thuoc_tinh || {}).map(([key, value]) => (
                        <div key={key}>
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            {key}: {value}
                          </Text>
                        </div>
                      ))}
                    </>}
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
              // loading={mutation.isPending}
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