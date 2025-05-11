import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  List,
  message,
  Modal,
  Radio,
  Select,
  Typography,
} from "antd";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import apiGhtk from "../config/ghtk";
import FomatVND from "../utils/FomatVND";
import instanceAxios from "../config/db";

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
  const [shippingFee, setShippingFee] = useState(null);

  const [formData, setFormData] = useState({
    pick_province: "Hà Nội",
    pick_district: "Hoàng Mai",
    province: "",
    district: "",
    ward: "",
    address: "",
    weight: 10000,
    transport: "road",
    deliver_option: "none",
  });

  // Calculate shipping fee when formData changes
  useEffect(() => {
    const { province, district, ward } = formData;

    if (province && district && ward) {
      const calculateShippingFee = async () => {
        try {
          const response = await apiGhtk.get(`/services/shipment/fee`, { params: formData });
          if (response?.data?.success === true) {
            setShippingFee(response?.data?.fee?.ship_fee_only);
          } else if (response?.data?.success === false) {
            message.error(response.message || "Không thể tính phí vận chuyển!");
          }
        } catch (error) {
          message.error("Lỗi khi tính phí vận chuyển!");
        }
      };

      calculateShippingFee();
    }
  }, [formData]);

  // Load provinces and cart data on mount
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/v1/address/provinces/")
      .then((response) => setProvinces(response?.data?.data))
      .catch((error) => console.error("Lỗi khi tải tỉnh/thành phố:", error));

    const cartItems = localStorage.getItem("checkoutItems");
    const cartTotal = localStorage.getItem("cartTotal");

    if (cartItems) setCartItems(JSON.parse(cartItems));
    if (cartTotal) setCartTotal(JSON.parse(cartTotal));
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      axios
        .get(`http://127.0.0.1:8000/api/v1/address/districts?province_code=${selectedProvince}`)
        .then((response) => setDistricts(response?.data?.data))
        .catch((error) => console.error("Lỗi khi tải quận/huyện:", error));
    }
  }, [selectedProvince]);

  // Load wards when district changes
  useEffect(() => {
    if (selectedDistrict) {
      axios
        .get(`http://127.0.0.1:8000/api/v1/address/communes?district_code=${selectedDistrict}`)
        .then((response) => setWards(response?.data?.data))
        .catch((error) => console.error("Lỗi khi tải phường/xã:", error));
    }
  }, [selectedDistrict]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setOrder((prev) => ({ ...prev, [id]: value }));
  };

  // On login, fetch addresses from API
  useEffect(() => {
    const userRaw = Cookies.get("user");
    if (!userRaw) return;

    const user = JSON.parse(userRaw);
    if (isLogin) {
      setOrder((prev) => ({
        ...prev,
        customer_id: user.customerId || null,
      }));

      instanceAxios
        .get("http://127.0.0.1:8000/api/v1/customer/shipping-address")
        .then((response) => {
          const fetchedAddresses = Array.isArray(response?.data?.data) ? response.data.data : [];
          setAddresses(fetchedAddresses);
          if (fetchedAddresses.length > 0) {
            const defaultAddr = fetchedAddresses.find((addr) => addr.is_default);
            if (defaultAddr) {
              setSelectedAddress(defaultAddr.id);
              setUseNewAddress(false);
            } else {
              setSelectedAddress(fetchedAddresses[0].id);
              setUseNewAddress(false);
            }
          } else {
            setUseNewAddress(true);
          }
        })
        .catch(() => {
          setUseNewAddress(true);
          setAddresses([]);
        });
    } else {
      setUseNewAddress(true);
    }
  }, [isLogin]);

  // Update form and order when selected address changes
  const dataform = addresses.find((addr) => addr.id === selectedAddress);
  useEffect(() => {
    if (dataform) {
      form.setFieldsValue({
        fullname: dataform.recipient_name || dataform.fullname,
        mobile: dataform.phone || dataform.mobile,
        email: dataform.email,
        specificAddress: dataform.address_line1 || dataform.specificAddress,
        province: dataform.province?.name || dataform.province,
        district: dataform.district?.name || dataform.district,
        ward: dataform.commune?.name || dataform.ward,
      });

      const provinceCode =
        provinces.find((p) => p.name === (dataform.province?.name || dataform.province))?.code || "";
      const districtCode =
        districts.find((d) => d.name === (dataform.district?.name || dataform.district))?.code || "";
      const wardCode =
        wards.find((w) => w.name === (dataform.commune?.name || dataform.ward))?.code || "";

      setSelectedProvince(provinceCode);
      setSelectedDistrict(districtCode);
      setSelectedWard(wardCode);

      // Update formData for shipping fee calculation
      setFormData(prev => ({
        ...prev,
        province: dataform.province?.name || dataform.province,
        district: dataform.district?.name || dataform.district,
        ward: dataform.commune?.name || dataform.ward,
        address: dataform.address_line1 || dataform.specificAddress
      }));

      setOrder((prev) => ({
        ...prev,
        customer_name: dataform.recipient_name || dataform.fullname,
        customer_phone: dataform.phone || dataform.mobile,
        customer_email: dataform.email,
        shipping_address:
          (dataform.address_line1 || dataform.specificAddress) +
          ", " +
          (dataform.commune?.name || dataform.ward) +
          ", " +
          (dataform.district?.name || dataform.district) +
          ", " +
          (dataform.province?.name || dataform.province),
        order_items: cartItems.map((item) => ({
          product_id: item.product_id,
          product_variant_id: item.variant_id || null,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
        })),
      }));
    } else {
      setUseNewAddress(true);
      const shippingAddress =
        specificAddress +
        ", " +
        (wards.find((w) => w.code === selectedWard)?.name || "") +
        ", " +
        (districts.find((d) => d.code === selectedDistrict)?.name || "") +
        ", " +
        (provinces.find((p) => p.code === selectedProvince)?.name || "");

      // Update formData for shipping fee calculation when using new address
      setFormData(prev => ({
        ...prev,
        province: provinces.find((p) => p.code === selectedProvince)?.name || "",
        district: districts.find((d) => d.code === selectedDistrict)?.name || "",
        ward: wards.find((w) => w.code === selectedWard)?.name || "",
        address: specificAddress
      }));

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

  // Update shipping fee calculation when formData changes
  useEffect(() => {
    const { province, district, ward } = formData;
    if (province && district && ward) {
      const calculateShippingFee = async () => {
        try {
          const response = await apiGhtk.get(`/services/shipment/fee`, { 
            params: {
              ...formData,
              weight: cartItems.reduce((total, item) => total + (item.weight || 0) * item.quantity, 0) || 10000
            } 
          });
          if (response?.data?.success === true) {
            setShippingFee(response?.data?.fee?.ship_fee_only);
          } else if (response?.data?.success === false) {
            message.error(response.message || "Không thể tính phí vận chuyển!");
          }
        } catch (error) {
          console.error("Lỗi khi tính phí vận chuyển:", error);
          message.error("Lỗi khi tính phí vận chuyển!");
        }
      };

      calculateShippingFee();
    }
  }, [formData, cartItems]);

  // Handle address selection from modal
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
    const discount = discountCode ? 10000 : 0;
    return subtotal + (shippingFee || 0) - discount;
  };

  const handleApplyDiscount = () => {
    message.info("Mã giảm giá chưa được hỗ trợ!");
  };

  // Handle order submission
  const handleSubmit = async () => {
    try {
      if (useNewAddress) {
        await form.validateFields();
      }
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
              ? `${dataform?.recipient_name || dataform?.fullname} - ${dataform?.phone || dataform?.mobile} - ${dataform?.address_line1 || dataform?.specificAddress}, ${dataform?.commune?.name || dataform?.ward}, ${dataform?.district?.name || dataform?.district}, ${dataform?.province?.name || dataform?.province}`
              : "Chưa có địa chỉ"}
            {isLogin && addresses.length > 0 && (
              <Button type="link" onClick={() => setShowAddressModal(true)}>
                Thay đổi
              </Button>
            )}
          </div>

          <Card
            title={isLogin && addresses.length > 0 ? "Địa chỉ" : "Địa chỉ mới"}
          >
            <Form layout="vertical" form={form}>
              <Form.Item label="Tên" name={"fullname"} required>
                <Input
                  id="customer_name"
                  value={order.customer_name}
                  onChange={handleInputChange}
                  disabled={dataform?.recipient_name || dataform?.fullname}
                  className="!bg-white !border !border-gray-300 !text-black"
                />
              </Form.Item>
              <Form.Item label="Số điện thoại" name={"mobile"} required>
                <Input
                  id="customer_phone"
                  value={order.customer_phone}
                  onChange={handleInputChange}
                  disabled={dataform?.phone || dataform?.mobile}
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
                {dataform?.province?.name || dataform?.province ? (
                  <Input
                    value={dataform?.province?.name || dataform?.province}
                    disabled
                    className="!bg-white !border !border-gray-300 !text-black"
                  />
                ) : (
                  <Select
                    placeholder="Chọn Tỉnh/Thành phố"
                    value={selectedProvince}
                    onChange={(value) => {
                      setFormData({ ...formData, province: provinces.find((p) => p.code === value)?.name });
                      setSelectedProvince(value);
                      setDistricts([]);
                      setWards([]);
                      setSelectedDistrict("");
                      setSelectedWard("");
                      form.setFieldsValue({
                        district: undefined,
                        ward: undefined,
                      });
                    }}
                    disabled={!!(dataform?.province?.name || dataform?.province)}
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
                {dataform?.district?.name || dataform?.district ? (
                  <Input
                    value={dataform?.district?.name || dataform?.district}
                    disabled
                    className="!bg-white !border !border-gray-300 !text-black"
                  />
                ) : (
                  <Select
                    placeholder="Chọn Quận/Huyện"
                    value={selectedDistrict}
                    onChange={(value) => {
                      setFormData({ ...formData, district: districts.find((d) => d.code === value)?.name });
                      setSelectedDistrict(value);
                      setWards([]);
                      setSelectedWard("");
                      form.setFieldsValue({
                        ward: undefined,
                      });
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
                {dataform?.commune?.name || dataform?.ward ? (
                  <Input
                    value={dataform?.commune?.name || dataform?.ward}
                    disabled
                    className="!bg-white !border !border-gray-300 !text-black"
                  />
                ) : (
                  <Select
                    placeholder="Chọn Phường/Xã"
                    value={selectedWard}
                    onChange={(value) => {
                      setFormData({ ...formData, ward: wards.find((w) => w.code === value)?.name });
                      setSelectedWard(value);
                    }}
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
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value });
                    setSpecificAddress(e.target.value);
                  }}
                  className="!bg-white !border !border-gray-300 !text-black"
                  disabled={!!(dataform?.address_line1 || dataform?.specificAddress)}
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
                    description={
                      <>
                        <div>SKU: {item.sku}</div>
                        {Object.entries(item.thuoc_tinh || {}).map(
                          ([key, value]) => (
                            <div key={key}>
                              <Text type="secondary" style={{ fontSize: 13 }}>
                                {key}: {value}
                              </Text>
                            </div>
                          )
                        )}
                      </>
                    }
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
              <Text>{shippingFee ? FomatVND(shippingFee) : "Hãy chọn địa điểm"} </Text>
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
                  {addr.recipient_name || addr.fullname} - {addr.phone || addr.mobile}
                </p>
                <p>
                  {addr.address_line1 || addr.specificAddress}, {addr.commune?.name || addr.ward}, {addr.district?.name || addr.district}, {addr.province?.name || addr.province}
                </p>
              </div>
              <div className="flex items-center">
                <Button
                  type="link"
                  onClick={() => handleSelectAddress(addr.id)}
                >
                  Chọn
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </Modal>
    </div>
  );
};

export default NewCheckout;
