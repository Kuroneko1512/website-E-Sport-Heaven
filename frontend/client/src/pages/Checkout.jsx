import React, { useState, useEffect, useMemo } from 'react';
import instanceAxios from '../config/db';

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  const miniCartData = useMemo(() => JSON.parse(localStorage.getItem("cartItems")) || [], []);
  useEffect(() => {
    setCartItems(miniCartData);
  }, [miniCartData]);

  const handleQuantityChange = (id, delta) => {
    setCartItems(
      cartItems.map((item) =>
        item.variant_id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const handleRemoveItem = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      const updatedCart = cartItems.filter((item) => item.id !== id);
      const updatedSelectedItems = selectedItems.filter((itemId) => itemId !== id);
  console.log(id);
      setCartItems(updatedCart);
      setSelectedItems(updatedSelectedItems);
  
      // Lưu giỏ hàng vào localStorage (nếu đang sử dụng)
      localStorage.setItem("cart", JSON.stringify(updatedCart));
  
      // Kiểm tra nếu giỏ hàng trống
      if (updatedCart.length === 0) {
        alert("Giỏ hàng của bạn hiện đang trống!");
      }
    }
  };

  const handleSelectItem = (variantId) => {
    if (selectedItems.includes(variantId)) {
      setSelectedItems(selectedItems.filter((id) => id !== variantId));
    } else {
      setSelectedItems([...selectedItems, variantId]);
    }
  };

  const handleSelectAllByProductId = (productId) => {
    // Kiểm tra xem đã chọn tất cả các variant của sản phẩm này chưa
    const selectedVariants = cartItems
      .filter((item) => item.product_id === productId)
      .map((item) => item.variant_id);

    const areAllSelected = selectedVariants.every((variantId) =>
      selectedItems.includes(variantId)
    );

    if (areAllSelected) {
      // Nếu tất cả các variant đã chọn, bỏ chọn tất cả
      setSelectedItems(selectedItems.filter((id) => !selectedVariants.includes(id)));
    } else {
      // Nếu chưa chọn tất cả, chọn tất cả variant của sản phẩm này
      setSelectedItems([...selectedItems, ...selectedVariants]);
    }
  };

  const handleSelectAll = () => {
    const allVariantIds = cartItems.map((item) => item.variant_id);
    if (selectedItems.length === allVariantIds.length) {
      setSelectedItems([]); // Deselect all
    } else {
      setSelectedItems(allVariantIds); // Select all
    }
  };

  const calculateSubtotal = () => {
    return cartItems
      .filter((item) => selectedItems.includes(item.variant_id))
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  return (
    <div className="bg-gray-100">
      <div className="container mx-auto p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4">GIỎ HÀNG</h1>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="pb-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === cartItems.map((item) => item.variant_id).length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="pb-2">Hình ảnh</th>
                <th className="pb-2">Tên sản phẩm</th>
                <th className="pb-2">Đơn giá</th>
                <th className="pb-2">Số lượng</th>
                <th className="pb-2">Thành tiền</th>
                <th className="pb-2">Xóa</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.variant_id} className="border-b">
                  <td className="py-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.variant_id)}
                      onChange={() => handleSelectItem(item.id)}
                    />
                  </td>
                  <td className="py-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover"
                    />
                  </td>
                  <td className="py-4">
                    <p>{item.name}</p>
                    <p>Size: {item.variant_id}</p>
                  </td>
                  <td className="py-4">
                  {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(parseFloat(item.price).toFixed(0))}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center">
                      <button
                        className="px-2 py-1 border rounded-l"
                        onClick={() => handleQuantityChange(item.variant_id, -1)}
                      >
                        −
                      </button>
                      <input
                        className="w-12 text-center border-t border-b"
                        type="number"
                        value={item.quantity}
                        readOnly
                      />
                      <button
                        className="px-2 py-1 border rounded-r"
                        onClick={() => handleQuantityChange(item.variant_id, 1)}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="py-4">
                    {/* ${(item.price * item.quantity).toFixed(2)} */}
                    {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(parseFloat(item.price * item.quantity).toFixed(0))}
                  </td>
                  <td className="py-4 text-red-500 cursor-pointer">
                    <button onClick={() => handleRemoveItem(item.variant_id)}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/*  */}
          <div className="flex flex-col flex-wrap content-end justify-end space-y-4   mt-4">
            <div className="text-lg">
              <span className="font-bold">Tổng tiền:</span>
              <span className="text-red-500 font-bold">
                {/* ${calculateSubtotal()} */}
                {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(parseFloat(calculateSubtotal()).toFixed(0))}
              </span>
            </div>
            <div className='w-1/3'>
              <button className="bg-gray-300 text-gray-700 text-lg px-4 py-2 rounded mr-2 w-1/2">
                Tiếp tục mua hàng
              </button>
              <button
                className="bg-gray-600 hover:bg-gray-800 text-white text-lg px-4 py-2 rounded w-2/5"
                disabled={selectedItems.length === 0}
              >
                Đặt hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
