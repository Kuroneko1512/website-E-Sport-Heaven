import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FomatVND from '../utils/FomatVND';
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
  message
} from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;

const NewCheckout = () => {

  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [discountCode, setDiscountCode] = useState('');
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [order, setOrder] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
    order_items: []
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');

  useEffect(() => {
    axios.get('https://provinces.open-api.vn/api/p/')
      .then(response => setProvinces(response.data))
      .catch(error => console.error('Lỗi khi tải tỉnh/thành phố:', error));

    const cartItems = localStorage.getItem('checkoutItems');
    const cartTotal = localStorage.getItem('cartTotal');

    if (cartItems) setCartItems(JSON.parse(cartItems));
    if (cartTotal) setCartTotal(JSON.parse(cartTotal));
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      axios.get(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
        .then(response => setDistricts(response.data.districts))
        .catch(error => console.error('Lỗi khi tải quận/huyện:', error));
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      axios.get(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
        .then(response => setWards(response.data.wards))
        .catch(error => console.error('Lỗi khi tải phường/xã:', error));
    }
  }, [selectedDistrict]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setOrder(prev => ({ ...prev, [id]: value }));
  };

  const calculateGrandTotal = () => {
    const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const shippingFee = 5000;
    const discount = discountCode ? 10000 : 0;
    return subtotal + shippingFee - discount;
  };

  const handleApplyDiscount = () => {
    message.info('Mã giảm giá chưa được hỗ trợ!');
  };

  const handleSubmit = async () => {
    const shippingAddressParts = [
      wards.find(w => w.code === Number(selectedWard))?.name,
      districts.find(d => d.code === Number(selectedDistrict))?.name,
      provinces.find(p => p.code === Number(selectedProvince))?.name
    ].filter(Boolean).join(', ');

    if (!order.customer_name || !order.customer_phone || !shippingAddressParts) {
      message.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    const orderData = {
      ...order,
      shipping_address: shippingAddressParts,
      amount: calculateGrandTotal(),
      order_items: cartItems.map(item => ({
        product_id: item.product_id,
        product_variant_id: item.variant_id || null,
        quantity: item.quantity,
        price: item.price
      })),
      payment_method: paymentMethod

    };

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/v1/order', orderData);
      if (paymentMethod === 'vnpay' && response.data.vnpUrl) {
        window.location.href = response.data.vnpUrl;
      } else {
        message.success('Đặt hàng thành công!');
        localStorage.setItem('orderCode', response.data.data.order_code);
        let checkoutItems = JSON.parse(localStorage.getItem('checkoutItems')) || [];
        let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        
        // Lọc các item trong cartItems, giữ lại những item không trùng với checkoutItems
        cartItems = cartItems.filter(item => !checkoutItems.some(checkoutItem => checkoutItem.id === item.id));
        
        // Cập nhật lại localStorage sau khi đã loại bỏ các item trùng
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        setCartItems([]);
        setCartTotal(0);
        setOrder({ customer_name: '', customer_email: '', customer_phone: '', shipping_address: '', order_items: [] });
        navigate('/thankyou');
      }
    } catch (error) {
      console.error('Lỗi khi đặt hàng:', error);
      message.error('Có lỗi xảy ra, vui lòng thử lại!');
    }
  };

  return (
    <div className="p-6 bg-white">
      <Title level={2}>Thanh toán</Title>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card title="Địa chỉ giao hàng">
            <Form layout="vertical">
              <Form.Item label="Tên">
                <Input id="customer_name" value={order.customer_name} onChange={handleInputChange} />
              </Form.Item>
              <Form.Item label="Số điện thoại">
                <Input id="customer_phone" value={order.customer_phone} onChange={handleInputChange} />
              </Form.Item>
              <Form.Item label="Email">
                <Input id="customer_email" value={order.customer_email} onChange={handleInputChange} />
              </Form.Item>
              <Form.Item label="Tỉnh/Thành phố">
                <Select
                  placeholder="Chọn Tỉnh/Thành phố"
                  value={selectedProvince}
                  onChange={(value) => {
                    setSelectedProvince(value);
                    setDistricts([]);
                    setWards([]);
                    setSelectedDistrict('');
                    setSelectedWard('');
                  }}
                >
                  {provinces.map(province => (
                    <Option key={province.code} value={province.code}>{province.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label="Quận/Huyện">
                <Select
                  placeholder="Chọn Quận/Huyện"
                  value={selectedDistrict}
                  onChange={value => {
                    setSelectedDistrict(value);
                    setWards([]);
                    setSelectedWard('');
                  }}
                  disabled={!selectedProvince}
                >
                  {districts.map(d => (
                    <Option key={d.code} value={d.code}>{d.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label="Phường/Xã">
                <Select
                  placeholder="Chọn Phường/Xã"
                  value={selectedWard}
                  onChange={setSelectedWard}
                  disabled={!selectedDistrict}
                >
                  {wards.map(w => (
                    <Option key={w.code} value={w.code}>{w.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </Card>
        </div>

        <Card title="Thông tin đơn hàng">
          <List
            dataSource={cartItems}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  title={`${item.name} (x${item.quantity})`}
                  description={`SKU: ${item.sku}`}
                />
                <Text>{FomatVND(item.price * item.quantity)}</Text>
              </List.Item>
            )}
          />

          <Divider />

          <Input
            placeholder="Nhập mã giảm giá"
            value={discountCode}
            onChange={e => setDiscountCode(e.target.value)}
            addonAfter={<Button onClick={handleApplyDiscount}>Áp dụng</Button>}
          />

          <Divider />

          <Radio.Group onChange={e => setPaymentMethod(e.target.value)} value={paymentMethod}>
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

          <Button type="primary" block className="mt-4" onClick={handleSubmit}>
            Tiếp tục thanh toán
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default NewCheckout;