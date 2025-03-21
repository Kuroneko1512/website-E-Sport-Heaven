import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
// import { Link } from 'react-router-dom';
import axios from 'axios';

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
        customer_email: '', // Cần lấy từ state hoặc auth context
        customer_phone: '',
        shipping_address: '',
        order_items: []
    });
    const handleChange = (e) => {
        const { id, value } = e.target;
        setOrder(prevOrder => ({
            ...prevOrder,
            [id]: value // Cập nhật theo ID của input
        }));
    };



    useEffect(() => {
        // Lấy danh sách tỉnh/thành phố
        axios.get('https://provinces.open-api.vn/api/p/')
            .then(response => setProvinces(response.data))
            .catch(error => console.error('Lỗi khi tải tỉnh/thành phố:', error));

        // Lấy giỏ hàng từ localStorage
        const cartItems = localStorage.getItem('checkoutItems');
        const cartTotal = localStorage.getItem('cartTotal');

        if (cartItems) setCartItems(JSON.parse(cartItems));
        if (cartTotal) setCartTotal(JSON.parse(cartTotal));
    }, []);

    useEffect(() => {
        if (selectedProvince) {
            // Lấy danh sách quận/huyện khi chọn tỉnh
            axios.get(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
                .then(response => setDistricts(response.data.districts))
                .catch(error => console.error('Lỗi khi tải quận/huyện:', error));
        }
    }, [selectedProvince]);

    useEffect(() => {
        if (selectedDistrict) {
            // Lấy danh sách phường/xã khi chọn quận/huyện
            axios.get(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
                .then(response => setWards(response.data.wards))
                .catch(error => console.error('Lỗi khi tải phường/xã:', error));
        }
    }, [selectedDistrict]);

    const calculateSubtotal = () => cartTotal;
    const calculateGrandTotal = () => {
        let total = calculateSubtotal();

        return total + 5.00
    };

    const handleApplyDiscount = () => {
        alert('Mã giảm giá chưa được hỗ trợ!');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();


        // Tạo địa chỉ giao hàng từ tỉnh/thành, quận/huyện, phường/xã
        const shippingAddressParts = [
            wards.find(w => w.code === Number(selectedWard))?.name,
            districts.find(d => d.code === Number(selectedDistrict))?.name,
            provinces.find(p => p.code === Number(selectedProvince))?.name
        ].filter(Boolean).join(', '); // Lọc các giá trị rỗng và nối chuỗi bằng dấu ", "

        // console.log("Address:", shippingAddressParts);

        // console.log([selectedWard, selectedDistrict, selectedProvince]);
        // Kiểm tra nếu thiếu thông tin quan trọng
        if (!order.customer_name || !order.customer_phone || !shippingAddressParts) {
            console.log(order);
            alert("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        const orderData = {
            customer_name: order.customer_name,
            customer_email: order.customer_email, // Có thể lấy từ auth
            customer_phone: order.customer_phone,
            shipping_address: shippingAddressParts,
            order_items: cartItems.map(item => ({
                product_id: item.product_id,
                product_variant_id: item.variant_id || null,
                quantity: item.quantity,
                price: item.price
            }))
        };

        try {

            const response = await axios.post("http://127.0.0.1:8000/api/v1/order", orderData, {
                headers: { "Content-Type": "application/json" }
            });

            console.log("Đặt hàng thành công:", response.data);
            alert("Đặt hàng thành công!");
            localStorage.setItem("orderCode", response.data.data.order_code);

            // Xóa giỏ hàng sau khi đặt hàng
            localStorage.removeItem('cartItems');
            localStorage.removeItem('cartTotal');
            setCartItems([]);
            setCartTotal(0);
            setOrder({
                customer_name: '',
                customer_email: '',
                customer_phone: '',
                shipping_address: '',
                order_items: []
            });
            navigate("/thankyou");

        } catch (error) {
            console.error("Lỗi khi đặt hàng:", error);
            alert("Có lỗi xảy ra, vui lòng thử lại!");
        }
    };

    return (
        <div className="bg-white text-gray-800">
            <main className="max-w-6xl mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6">Thanh toán</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="col-span-2">
                        <h2 className="text-2xl font-bold mb-4">Địa chỉ giao hàng</h2>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="customer_name">Tên</label>
                            <input
                                className="shadow border rounded w-full py-2 px-3 text-gray-700"
                                id="customer_name"
                                type="text"
                                placeholder="Nhập tên"
                                value={order.customer_name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="customer_phone">Số điện thoại</label>
                            <input
                                className="shadow border rounded w-full py-2 px-3 text-gray-700"
                                id="customer_phone"
                                type="text"
                                placeholder="Nhập số điện thoại"
                                value={order.customer_phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="customer_email">Email</label>
                            <input
                                className="shadow border rounded w-full py-2 px-3 text-gray-700"
                                id="customer_email"
                                type="text"
                                placeholder="Nhập email"
                                value={order.customer_email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="province">Tỉnh/Thành phố</label>
                            <select
                                className="block w-full border px-4 py-2 rounded"
                                id="province"
                                value={selectedProvince}
                                onChange={(e) => {
                                    setSelectedProvince(e.target.value);
                                    setDistricts([]);
                                    setWards([]);
                                    setSelectedDistrict('');
                                    setSelectedWard('');
                                }}
                            >
                                <option value="">Chọn Tỉnh/Thành phố</option>
                                {provinces.map(province => (
                                    <option key={province.code} value={province.code}>{province.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="district">Quận/Huyện</label>
                            <select
                                className="block w-full border px-4 py-2 rounded"
                                id="district"
                                value={selectedDistrict}
                                onChange={(e) => {
                                    setSelectedDistrict(e.target.value);
                                    setWards([]);
                                    setSelectedWard('');
                                }}
                                disabled={!selectedProvince}
                            >
                                <option value="">Chọn Quận/Huyện</option>
                                {districts.map(district => (
                                    <option key={district.code} value={district.code}>{district.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ward">Phường/Xã</label>
                            <select
                                className="block w-full border px-4 py-2 rounded"
                                id="ward"
                                value={selectedWard}
                                onChange={(e) => setSelectedWard(e.target.value)}
                                disabled={!selectedDistrict}
                            >
                                <option value="">Chọn Phường/Xã</option>
                                {wards.map(ward => (
                                    <option key={ward.code} value={ward.code}>{ward.name}</option>
                                ))}
                            </select>
                        </div>



                    </div>

                    <div className="border border-gray-200 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">Sản phẩm đã chọn</h2>
                        <ul>
                            {cartItems.map((item) => (
                                <li key={item.id} className="flex justify-between mb-2 border-b pb-2">
                                    <div>
                                        <span>{item.name} (x{item.quantity})</span>
                                        <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                                    </div>
                                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mb-4">
                            <label className="block text-gray-600 mb-2">Nhập mã giảm giá</label>
                            <div className="flex">
                                <input type="text" className="border border-gray-300 rounded-l px-4 py-2 w-full" value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} />
                                <button className="bg-black text-white px-4 py-2 rounded-r" onClick={handleApplyDiscount}>Áp dụng</button>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-600 mb-2">Chọn phương thức thanh toán</label>
                            <div className="flex flex-col gap-2">
                                {/* Thanh toán khi nhận hàng */}
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="cod"
                                        // checked={paymentMethod === "cod"}
                                        // onChange={() => setPaymentMethod("cod")}
                                        className="mr-2"
                                    />
                                    Thanh toán khi nhận hàng (COD)
                                </label>

                                {/* Thanh toán VNPay */}
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="vnpay"
                                        // checked={paymentMethod === "vnpay"}
                                        // onChange={() => setPaymentMethod("vnpay")}
                                        className="mr-2"
                                    />
                                    Thanh toán qua VNPay
                                </label>
                            </div></div>

                        <div className="flex justify-between mb-4">
                            <span className="text-lg">Phí vận chuyển</span>
                            <span className="text-lg">$5.00</span>
                        </div>


                        <div className="flex justify-between mb-4">
                            <span className="text-lg font-bold">Tổng cộng</span>
                            <span className="text-lg font-bold">${calculateGrandTotal()}</span>
                        </div>

                        <a onClick={handleSubmit} className="bg-black text-white w-full py-3 rounded text-center block">Tiếp tục thanh toán</a>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NewCheckout;
