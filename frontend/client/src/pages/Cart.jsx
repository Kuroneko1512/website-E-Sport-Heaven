import  { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  // Lấy dữ liệu từ localStorage khi component mount
  useEffect(() => {
    const storedCart = localStorage.getItem('cartItems');
    console.log(storedCart);
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  // Cập nhật localStorage khi giỏ hàng thay đổi
  const updateLocalStorage = (items) => {
    localStorage.setItem('cartItems', JSON.stringify(items));
    setCartItems(items);
  
  };

  // Xử lý thay đổi số lượng sản phẩm
  const handleQuantityChange = (id, delta) => {
    const updatedCart = cartItems.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    );
    updateLocalStorage(updatedCart);
    console.log(cartItems)
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const handleRemoveItem = (id) => {

    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      const updatedCart = cartItems.filter(item => item.id !== id);
      console.log(updatedCart)
      updateLocalStorage(updatedCart);
    }
  };

  // Tính tổng tiền hàng
  const calculateSubtotal = () => {
    const total = cartItems.reduce((total, item) => total + parseFloat(item?.price) * parseFloat(item.quantity), 0).toFixed(2)
    localStorage.setItem("cartTotal", JSON.stringify(total));
    return parseFloat(total);
    
  };

  // Áp dụng mã giảm giá
  const handleApplyDiscount = () => {
    if (discountCode === 'FLAT50') {
      setDiscountAmount(0.5 * parseFloat(calculateSubtotal()));
      alert('Mã giảm giá áp dụng thành công!');
    } else {
      setDiscountAmount(0);
      alert('Mã giảm giá không hợp lệ!');
    }
  };

  // Tính tổng tiền sau khi áp dụng giảm giá
  const calculateGrandTotal = () => {
    return (parseFloat(calculateSubtotal()) + 5.00 - discountAmount).toFixed(2);
  };
  
  return (
    <div className="bg-white text-gray-800">
      <main className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Thanh toán</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2">
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="pb-4">Sản phẩm</th>
                  <th className="pb-4"></th>
                  <th className="pb-4">Giá</th>
                  <th className="pb-4">Số lượng</th>
                  <th className="pb-4">Tổng</th>
                  <th className="pb-4"></th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className="py-4">
                      {item.product?.image && (
                        <img src={item.product.image} alt={item.product.name} className="h-16" width="50" height="50" />
                      )}
                    </td>
                    <td className="py-4">
                      <h2 className="text-lg font-semibold">{item?.name || 'Sản phẩm'}</h2>
                      <p className="text-gray-600">Sku: {item?.sku || 'N/A'}</p>
                    </td>
                    <td className="py-4 text-lg">${parseFloat(item?.price || 0).toFixed(2)}</td>
                    <td className="py-4">
                      <div className="flex items-center border border-gray-300 rounded w-fit">
                        <button className="px-2 py-1" onClick={() => handleQuantityChange(item.id, -1)}>-</button>
                        <span className="px-4 py-1">{item.quantity}</span>
                        <button className="px-2 py-1" onClick={() => handleQuantityChange(item.id, 1)}>+</button>
                      </div>
                    </td>
                    <td className="py-4 text-lg">${(parseFloat(item?.price) * parseFloat(item.quantity)).toFixed(2)}</td>
                    <td className="py-4">
                      <button className="text-red-500" onClick={() => handleRemoveItem(item.id)}>
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border border-gray-200 p-6 rounded-lg">
            <div className="flex justify-between mb-4">
              <span className="text-lg">Tổng phụ</span>
              <span className="text-lg">${calculateSubtotal()}</span>
            </div>
            <div className="mb-4">
              <label className="block text-gray-600 mb-2">Nhập mã giảm giá</label>
              <div className="flex">
                <input type="text" className="border border-gray-300 rounded-l px-4 py-2 w-full" value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} />
                <button className="bg-black text-white px-4 py-2 rounded-r" onClick={handleApplyDiscount}>Áp dụng</button>
              </div>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-lg">Phí vận chuyển</span>
              <span className="text-lg">$5.00</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-lg font-bold">Tổng cộng</span>
              <span className="text-lg font-bold">${calculateGrandTotal()}</span>
            </div>
            <button className="bg-black text-white w-full py-3 rounded">
              <Link to={`/newcheckout`}>Tiếp tục thanh toán</Link>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Cart;
