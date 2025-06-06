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
  Spin,
  Typography,
} from "antd";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiGhtk from "../config/ghtk";
import FomatVND from "../utils/FomatVND";
import instanceAxios from "../config/db";

const { Title, Text } = Typography;
const { Option } = Select;

// Custom hook cho phí vận chuyển
const useShippingFee = (formData, cartItems) => {
  const [shippingFee, setShippingFee] = useState(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

  useEffect(() => {
    const { province, district, ward } = formData;
    if (province && district && ward) {
      const calculateShippingFee = async () => {
        setIsCalculatingShipping(true);
        try {
          const response = await apiGhtk.get(`/shipping/fee`, {
            params: { ...formData },
          });
          if (response?.data?.success === true) {
            setShippingFee(response?.data?.fee?.ship_fee_only);
          } else if (response?.data?.success === false) {
            message.error(response.message || "Không thể tính phí vận chuyển!");
          }
        } catch (error) {
          console.error("Lỗi khi tính phí vận chuyển:", error);
          message.error("Lỗi khi tính phí vận chuyển!");
        } finally {
          setIsCalculatingShipping(false);
        }
      };

      calculateShippingFee();
    }
  }, [formData, cartItems]);

  return { shippingFee, isCalculatingShipping };
};

// Custom hook cho dữ liệu địa chỉ
const useAddressData = () => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [provincesLoading, setProvincesLoading] = useState(false); // Thêm trạng thái loading
  const [districtsLoading, setDistrictsLoading] = useState(false); // Add districtsLoading state
  const [wardsLoading, setWardsLoading] = useState(false); // Add wardsLoading state
  useEffect(() => {
    setProvincesLoading(true); // Bắt đầu tải dữ liệu
    axios
      .get("http://127.0.0.1:8000/api/v1/address/provinces/")
      .then((response) => setProvinces(response?.data?.data))
      .catch((error) => console.error("Lỗi khi tải tỉnh/thành phố:", error))
      .finally(() => setProvincesLoading(false)); // Kết thúc tải dữ liệu
  }, []);

  const loadDistricts = (provinceCode) => {
    setDistrictsLoading(true); // Start loading districts
    axios
      .get(
        `http://127.0.0.1:8000/api/v1/address/districts?province_code=${provinceCode}`
      )
      .then((response) => setDistricts(response?.data?.data))
      .catch((error) => console.error("Lỗi khi tải quận/huyện:", error))
      .finally(() => setDistrictsLoading(false)); // End loading districts
  };

  const loadWards = (districtCode) => {
    setWardsLoading(true); // Start loading wards
    axios
      .get(
        `http://127.0.0.1:8000/api/v1/address/communes?district_code=${districtCode}`
      )
      .then((response) => setWards(response?.data?.data))
      .catch((error) => console.error("Lỗi khi tải phường/xã:", error))
      .finally(() => setWardsLoading(false)); // End loading wards
  };

  return { provinces, districts, wards, loadDistricts, loadWards };
};

// Hàm chuyển đổi chuỗi ngày giờ về định dạng ngày giờ Việt Nam
function parseDate(str) {
  if (!str) return null;
  // Nếu đã có 'T' thì giữ nguyên, nếu chưa thì thay ' ' bằng 'T'
  // Sau đó chuyển về giờ Việt Nam (UTC+7)
  let date = new Date(str.includes("T") ? str : str.replace(" ", "T"));
  // Nếu date là invalid thì trả về null
  if (isNaN(date.getTime())) return null;
  return date;
}

// Hàm kiểm tra tính hợp lệ của mã giảm giá
const isCouponValid = (coupon, subtotal) => {
  console.log("coupon", coupon, "subtotal", subtotal);
  const now = new Date();
  console.log("now", now);
  console.log("start_date", parseDate(coupon?.start_date));
  console.log("end_date", parseDate(coupon?.end_date));
  return (
    coupon?.is_active === 0 &&
    parseDate(coupon?.start_date) <= now &&
    parseDate(coupon?.end_date) >= now &&
    // (coupon?.max_uses === null || coupon?.used_count < coupon?.max_uses) &&
    Number(subtotal) >= Number(coupon?.min_order_amount)
  );
};

const calculateDiscount = (coupon, subtotal) => {
  if (!coupon) return 0;
  let discount = 0;
  if (coupon.discount_type === 0) {
    discount = subtotal * (Number(coupon.discount_value) / 100);
    if (
      Number(coupon.max_discount_amount) > 0 &&
      discount > Number(coupon.max_discount_amount)
    ) {
      discount = Number(coupon.max_discount_amount);
    }
  } else {
    discount = Number(coupon.discount_value);
  }
  // Không cho giảm vượt quá tổng tiền hàng
  return Math.min(discount, subtotal);
};

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
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [specificAddress, setSpecificAddress] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [order, setOrder] = useState({ customer_note: "Giao hàng tận nơi" });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [submit, setSubmit] = useState(false);

  // Clear user-related data on logout
  useEffect(() => {
    if (!isLogin) {
      setUseNewAddress(false);
      setShowAddressModal(false);
      setAddresses([]);
      setSelectedAddress(null);
      setDiscountCode("");
      setAvailableCoupons([]);
      setSelectedCoupon(null);
      setSpecificAddress("");
      setSelectedProvince("");
      setSelectedDistrict("");
      setSelectedWard("");
      setOrder({ customer_note: "Giao hàng tận nơi" });
      setPaymentMethod("cod");
      setSubmit(false);
      // Reset form fields on logout
      form.resetFields();
    }
  }, [isLogin, form]);

  const [formData, setFormData] = useState({
    pick_province: "Hà Nội",
    pick_district: "Hoàng Mai",
    province: "",
    district: "",
    ward: "",
    address: "",
    weight: 10000,
    value: 10000,
    transport: "road",
    deliver_option: "xteam",
  });

  const {
    provinces,
    districts,
    wards,
    loadDistricts,
    loadWards,
    provincesLoading,
    districtsLoading,
    wardsLoading,
  } = useAddressData();
  const { shippingFee, isCalculatingShipping } = useShippingFee(
    formData,
    cartItems
  );

  // Thêm useEffect để đảm bảo tính phí vận chuyển được tính lại khi formData thay đổi và có đủ thông tin mã địa chỉ
  useEffect(() => {
    const { province, district, ward, address } = formData;
    if (province && district && ward && address) {
      // Không cần làm gì thêm vì useShippingFee đã tự động tính phí khi formData thay đổi
      // Nhưng có thể reset trạng thái hoặc xử lý thêm nếu cần
    }
  }, [formData]);
  const queryClient = useQueryClient();

  // Load cart data on mount
  useEffect(() => {
    const cartItems = localStorage.getItem("checkoutItems");
    const cartTotal = localStorage.getItem("cartTotal");

    if (cartItems) setCartItems(JSON.parse(cartItems));
    if (cartTotal) setCartTotal(JSON.parse(cartTotal));
  }, []);

  // Fetch addresses if logged in
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
          const fetchedAddresses = Array.isArray(response?.data?.data)
            ? response.data.data
            : [];
          setAddresses(fetchedAddresses);
          if (fetchedAddresses.length > 0) {
            const defaultAddr = fetchedAddresses.find(
              (addr) => addr.is_default
            );
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

      // Try to get codes directly from API response first
      let provinceCode = dataform.province?.code;
      let districtCode = dataform.district?.code;
      let wardCode = dataform.commune?.code;

      // If codes are not available in API response, try to find them from names
      if (!provinceCode) {
        provinceCode = provinces.find(
          (p) => p.name === (dataform.province?.name || dataform.province)
        )?.code;
      }
      if (!districtCode) {
        districtCode = districts.find(
          (d) => d.name === (dataform.district?.name || dataform.district)
        )?.code;
      }
      if (!wardCode) {
        wardCode = wards.find(
          (w) => w.name === (dataform.commune?.name || dataform.ward)
        )?.code;
      }

      // Validate codes
      if (!provinceCode) {
        message.error("Không tìm thấy mã tỉnh/thành phố!");
        return;
      }
      if (!districtCode) {
        message.error("Không tìm thấy mã quận/huyện!");
        return;
      }
      if (!wardCode) {
        message.error("Không tìm thấy mã phường/xã!");
        return;
      }

      setSelectedProvince(provinceCode);
      setSelectedDistrict(districtCode);
      setSelectedWard(wardCode);

      setFormData((prev) => ({
        ...prev,
        province: provinceCode,
        district: districtCode,
        ward: wardCode,
        address: dataform.address_line1 || dataform.specificAddress,
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

      setFormData((prev) => ({
        ...prev,
        province: selectedProvince,
        district: selectedDistrict,
        ward: selectedWard,
        address: specificAddress,
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

  // Query for fetching available coupons
  const {
    data: couponsData,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["coupons"],
    queryFn: async () => {
      const response = await instanceAxios.get("api/v1/coupon");
      return response?.data?.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  console.log("couponsData", couponsData);

  // Calculate subtotal without coupon discount
  const calculateSubtotal = useMemo(() => {
    const subtotal = cartItems.reduce(
      (total, item) =>
        total +
        (item.price - (item.price * item.discount) / 100) * item.quantity,
      0
    );
    return subtotal;
  }, [cartItems]);

  console.log("calculateSubtotal", calculateSubtotal);

  // Process coupons data when it changes
  useEffect(() => {
    if (Array.isArray(couponsData)) {
      const validCoupons = couponsData?.filter((coupon) =>
        isCouponValid(coupon, calculateSubtotal)
      );
      console.log("validCoupons", validCoupons);
      setAvailableCoupons(validCoupons);
      // console.log("availableCoupons", validCoupons);

      // Nếu coupon đang chọn không còn hợp lệ thì reset
      if (
        selectedCoupon &&
        !validCoupons.some((c) => c.id === selectedCoupon.id)
      ) {
        setSelectedCoupon(null);
        setDiscountCode("");
      }
    }
  }, [couponsData, calculateSubtotal, selectedCoupon]);

  useEffect(() => {
    console.log("selectedCoupon", selectedCoupon);
  }, [selectedCoupon]);

  // Calculate grand total with useMemo
  const grandTotal = useMemo(() => {
    const discount = calculateDiscount(selectedCoupon, calculateSubtotal);
    // console.log("discount", discount);
    const total = calculateSubtotal + (shippingFee || 0) - discount;
    // console.log("grandTotal", total);
    return Math.floor(total);
  }, [calculateSubtotal, shippingFee, selectedCoupon]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      value: grandTotal,
    }));
  }, [grandTotal]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setOrder((prev) => ({ ...prev, [id]: value }));
  };

  // Handle address selection
  const handleSelectAddress = (id) => {
    setSelectedAddress(id);
    setShowAddressModal(false);
    setUseNewAddress(false);
  };

  // Mutation for creating order
  const createOrderMutation = useMutation({
    mutationFn: async (orderData) => {
      const response = await instanceAxios.post("api/v1/order", orderData);
      return response.data;
    },
    onError: (error) => {
      // Ưu tiên hiển thị thông báo từ backend
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Có lỗi xảy ra, vui lòng thử lại!";

      message.error(errorMessage);
      console.error("Lỗi khi đặt hàng:", error);
      setSubmit(false);
    },
  });

  // Mutation for updating coupon usage
  const updateCouponMutation = useMutation({
    mutationFn: async ({ couponId, usedCount }) => {
      const response = await instanceAxios.put(`api/v1/coupon/${couponId}`, {
        used_count: usedCount,
      });
      return response.data;
    },
    onError: (error) => {
      console.error("Lỗi khi cập nhật mã giảm giá:", error);
      message.error("Không thể cập nhật mã giảm giá. Vui lòng liên hệ hỗ trợ.");
    },
  });

  // Mutation for deleting order
  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId) => {
      const response = await instanceAxios.delete(`api/v1/order/${orderId}`);
      return response.data;
    },
    onError: (error) => {
      console.error("Lỗi khi xóa đơn hàng:", error);
      message.error(
        "Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng liên hệ hỗ trợ."
      );
    },
  });

  // Query for validating coupon
  const validateCouponQuery = useQuery({
    queryKey: ["coupon", selectedCoupon?.id],
    queryFn: async () => {
      if (!selectedCoupon) return null;
      const response = await instanceAxios.get(
        `api/v1/coupon/${selectedCoupon.id}`
      );
      return response.data;
    },
    enabled: !!selectedCoupon,
  });

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

      if (!shippingFee) {
        message.error(
          "Vui lòng chọn địa chỉ giao hàng để tính phí vận chuyển!"
        );
        return;
      }

      if (isCalculatingShipping) {
        message.error("Đang tính phí vận chuyển, vui lòng đợi trong giây lát!");
        return;
      }

      setSubmit(true);
      const orderData = {
        ...order,
        amount: grandTotal,
        payment_method: paymentMethod,
        shipping_fee: shippingFee || 0,
        coupon_id: selectedCoupon?.id || null,
        order_coupon_code: selectedCoupon?.code || null,
        order_coupon_name: selectedCoupon?.name || null,
        order_discount_type: selectedCoupon
          ? selectedCoupon.discount_type === 0
            ? 0
            : 1
          : null,
        order_discount_value: selectedCoupon?.discount_value || null,
        order_discount_amount: selectedCoupon
          ? selectedCoupon.discount_type === 0
            ? calculateDiscount(selectedCoupon, calculateSubtotal)
            : Number(selectedCoupon.discount_value)
          : null,
      };
      console.log("orderData", orderData);
      const orderResponse = await createOrderMutation.mutateAsync(orderData);

      if (orderResponse.success && selectedCoupon) {
        const currentCoupon = validateCouponQuery.data;
        const subtotal = cartItems.reduce(
          (total, item) =>
            total +
            (item.price - (item.price * item.discount) / 100) * item.quantity,
          0
        );

        if (!isCouponValid(currentCoupon, subtotal)) {
          await deleteOrderMutation.mutateAsync(orderResponse.data.id);
          setSelectedCoupon(null);
          setDiscountCode("");
          setSubmit(false);
          return;
        }

        await updateCouponMutation.mutateAsync({
          couponId: selectedCoupon.id,
          usedCount: currentCoupon.used_count + 1,
        });
      }

      if (paymentMethod === "vnpay" && orderResponse.vnpUrl) {
        window.location.href = orderResponse.vnpUrl;
      } else {
        message.success("Đặt hàng thành công!");
        localStorage.setItem("orderCode", orderResponse.data.order_code);
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
      setSubmit(false);
    }
  };

  return (
    <div className="p-6 bg-white" style={{ position: "relative" }}>
      {/* Overlay loading khi submit */}
      {submit && (
        <div className="fixed inset-0 w-screen h-screen bg-white/70 backdrop-blur-sm z-[9999] flex items-center justify-center pointer-events-auto transition-colors duration-200">
          <div className="flex flex-col items-center justify-center">
            <Spin size="large" />
            <p className="mt-5 text-gray-700 text-xl font-semibold tracking-wide text-center">
              Đang xử lý thanh toán...
            </p>
          </div>
        </div>
      )}
      <Title level={2}>Thanh toán</Title>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <div className="mb-4">
            <Text strong>Địa chỉ giao hàng:</Text>{" "}
            {dataform
              ? `${dataform?.recipient_name || dataform?.fullname} - ${
                  dataform?.phone || dataform?.mobile
                } - ${dataform?.address_line1 || dataform?.specificAddress}, ${
                  dataform?.commune?.name || dataform?.ward
                }, ${dataform?.district?.name || dataform?.district}, ${
                  dataform?.province?.name || dataform?.province
                }`
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
                name="province"
                label="Tỉnh/Thành phố"
                rules={[{ required: true, message: "Chọn tỉnh/thành phố" }]}
              >
                {dataform?.province?.name || dataform?.province ? (
                  <Input
                    value={dataform?.province?.name || dataform?.province}
                    disabled
                    className="!bg-white !border !border-gray-300 !text-black"
                  />
                ) : (
                  <Select
                    placeholder="Chọn tỉnh/thành phố"
                    loading={provincesLoading}
                    value={selectedProvince}
                    onChange={(val) => {
                      setSelectedProvince(val);
                      setSelectedDistrict("");
                      setSelectedWard("");
                      form.setFieldsValue({
                        district: undefined,
                        ward: undefined,
                      });
                      loadDistricts(val); // Đảm bảo các quận được tải khi một tỉnh được chọn
                    }}
                  >
                    {provinces.map((p) => (
                      <Option key={p.code} value={p.code}>
                        {p.name}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>

              <Form.Item
                name="district"
                label="Quận/Huyện"
                rules={[{ required: true, message: "Chọn quận/huyện" }]}
              >
                {dataform?.district?.name || dataform?.district ? (
                  <Input
                    value={dataform?.district?.name || dataform?.district}
                    disabled
                    className="!bg-white !border !border-gray-300 !text-black"
                  />
                ) : (
                  <Select
                    placeholder="Chọn quận/huyện"
                    loading={districtsLoading}
                    disabled={!selectedProvince}
                    value={selectedDistrict}
                    onChange={(val) => {
                      setSelectedDistrict(val);
                      setSelectedWard("");
                      form.setFieldsValue({ ward: undefined });
                      loadWards(val); // Đảm bảo các phường/xã được tải khi một quận được chọn
                    }}
                  >
                    {districts.map((d) => (
                      <Option key={d.code} value={d.code}>
                        {d.name}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>

              <Form.Item
                name="ward"
                label="Phường/Xã"
                rules={[{ required: true, message: "Chọn phường/xã" }]}
              >
                {dataform?.commune?.name || dataform?.ward ? (
                  <Input
                    value={dataform?.commune?.name || dataform?.ward}
                    disabled
                    className="!bg-white !border !border-gray-300 !text-black"
                  />
                ) : (
                  <Select
                    placeholder="Chọn phường/xã"
                    loading={wardsLoading}
                    disabled={!selectedDistrict}
                    value={selectedWard}
                    onChange={(val) => setSelectedWard(val)}
                  >
                    {wards.map((w) => (
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
                  value={specificAddress}
                  onChange={(e) => {
                    setSpecificAddress(e.target.value);
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }));
                  }}
                  disabled={
                    !!(dataform?.address_line1 || dataform?.specificAddress)
                  }
                  className="!bg-white !border !border-gray-300 !text-black"
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
                        {item?.thuoc_tinh?.map((value) => (
                          <div key={value}>
                            <Text type="secondary" style={{ fontSize: 13 }}>
                              {value}
                            </Text>
                          </div>
                        ))}
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

            <div className="mb-4">
              <Text strong>Mã giảm giá</Text>
              <div className="grid grid-cols-1 gap-4 mt-2">
                {availableCoupons.length > 0 ? (
                  availableCoupons.map((coupon) => (
                    <Card
                      key={coupon.id}
                      className={`cursor-pointer transition-all ${
                        selectedCoupon?.id === coupon.id
                          ? "border-blue-500"
                          : ""
                      }`}
                      onClick={() => {
                        if (selectedCoupon?.id === coupon.id) {
                          setSelectedCoupon(null);
                          setDiscountCode("");
                        } else {
                          setSelectedCoupon(coupon);
                          setDiscountCode(coupon.code);
                        }
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <Text strong className="text-lg tracking-wider">
                            {coupon.code.toUpperCase()}
                          </Text>
                          <div className="text-sm mt-1">
                            {coupon.discount_type === 0
                              ? `Giảm ${coupon.discount_value}%`
                              : `Giảm ${FomatVND(coupon.discount_value)}`}
                          </div>
                        </div>
                        <Button
                          type={
                            selectedCoupon?.id === coupon.id
                              ? "primary"
                              : "default"
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            if (selectedCoupon?.id === coupon.id) {
                              setSelectedCoupon(null);
                              setDiscountCode("");
                            } else {
                              setSelectedCoupon(coupon);
                              setDiscountCode(coupon.code);
                            }
                          }}
                        >
                          {selectedCoupon?.id === coupon.id
                            ? "Đã chọn"
                            : "Áp dụng"}
                        </Button>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    Không có mã giảm giá khả dụng cho đơn hàng này
                  </div>
                )}
              </div>
            </div>
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
              <Text>
                {isCalculatingShipping
                  ? "Đang tính..."
                  : shippingFee
                  ? FomatVND(shippingFee)
                  : "Hãy chọn địa điểm"}
              </Text>
            </div>
            <div className="flex justify-between font-bold">
              <Text strong>Tổng cộng</Text>
              <Text strong>{FomatVND(grandTotal)}</Text>
            </div>

            <Button
              type="primary"
              block
              className="mt-4"
              onClick={handleSubmit}
              disabled={submit || cartItems.length === 0}
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
                  {addr.recipient_name || addr.fullname} -{" "}
                  {addr.phone || addr.mobile}
                </p>
                <p>
                  {addr.address_line1 || addr.specificAddress},{" "}
                  {addr.commune?.name || addr.ward},{" "}
                  {addr.district?.name || addr.district},{" "}
                  {addr.province?.name || addr.province}
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
