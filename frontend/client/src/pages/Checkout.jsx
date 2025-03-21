import React, { useState, useEffect, useMemo } from 'react';
import instanceAxios from '../config/db';
import { useNavigate } from 'react-router-dom';
import FomatVND from '../utils/FomatVND';

const Chekout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const nav = useNavigate()

  const miniCartData = useMemo(() => JSON.parse(localStorage.getItem("cartItems")) || [], []);
  useEffect(() => {
    setCartItems(miniCartData);
  }, [miniCartData]);

  // Hàm thay đổi số lượng sản phẩm
  const handleQuantityChange = (productId, variantId, delta) => {
    setCartItems(
      cartItems.map((item) =>
        item.product_id === productId && (!variantId || item.variant_id === variantId)
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  // Hàm xóa sản phẩm khỏi giỏ hàng
  const handleRemoveItem = (productId, variantId) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      const updatedCartItems = cartItems.filter((item) => 
        item.product_id !== productId || (variantId && item.variant_id !== variantId)
      );
      setCartItems(updatedCartItems);
      setSelectedItems(selectedItems.filter((itemId) => itemId.product_id !== productId || (variantId && itemId.variant_id !== variantId)));
      localStorage.setItem("cartItems", JSON.stringify(updatedCartItems));
    }
  };

  // Hàm chọn sản phẩm
  const handleSelectItem = (productId, variantId) => {
    let updatedSelectedItems;
    const itemKey = { product_id: productId, variant_id: variantId };
    const isSelected = selectedItems.some((item) => item.product_id === productId && (!variantId || item.variant_id === variantId));
    if (isSelected) {
      updatedSelectedItems = selectedItems.filter((item) => item.product_id !== productId || (variantId && item.variant_id !== variantId));
    } else {
      updatedSelectedItems = [...selectedItems, itemKey];
    }
    setSelectedItems(updatedSelectedItems);
  };

  // Hàm chọn tất cả các biến thể của sản phẩm
  const handleSelectAllByProductId = (productId) => {
    const selectedVariants = cartItems
      .filter((item) => item.product_id === productId)
      .map((item) => ({ product_id: item.product_id, variant_id: item.variant_id }));
  
    const areAllSelected = selectedVariants.every((variant) =>
      selectedItems.some((item) => item.product_id === variant.product_id && item.variant_id === variant.variant_id)
    );
  
    let updatedSelectedItems;
    if (areAllSelected) {
      updatedSelectedItems = selectedItems.filter((item) => !selectedVariants.some((variant) => item.product_id === variant.product_id && item.variant_id === variant.variant_id));
    } else {
      updatedSelectedItems = [...selectedItems, ...selectedVariants];
    }
    setSelectedItems(updatedSelectedItems);
  };

  // Hàm chọn tất cả sản phẩm
  const handleSelectAll = () => {
    const allItems = cartItems.map((item) => ({ product_id: item.product_id, variant_id: item.variant_id }));
    let updatedSelectedItems;
    if (selectedItems.length === allItems.length) {
      updatedSelectedItems = []; // Bỏ chọn tất cả
    } else {
      updatedSelectedItems = allItems; // Chọn tất cả
    }
    setSelectedItems(updatedSelectedItems);
  };

  // Hàm tính tổng tiền
  const calculateSubtotal = () => {
    return cartItems
      .filter((item) => selectedItems.some((selected) => selected.product_id === item.product_id && (!item.variant_id || selected.variant_id === item.variant_id)))
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  // Hàm xử lý thanh toán
  const handleCheckout = () => {
    const selectedCartItems = cartItems.filter((item) => selectedItems.some((selected) => selected.product_id === item.product_id && (!item.variant_id || selected.variant_id === item.variant_id)));
    setCheckoutItems(selectedCartItems);
    localStorage.setItem("checkoutItems", JSON.stringify(selectedCartItems));
    nav('/newcheckout')
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
                    checked={selectedItems.length === cartItems.length}
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
              {cartItems.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.some((selected) => selected.product_id === item.product_id && (!item.variant_id || selected.variant_id === item.variant_id))}
                      onChange={() => handleSelectItem(item.product_id, item.variant_id)}
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
                    {FomatVND(item.price)}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center">
                      <button
                        className="px-2 py-1 border rounded-l"
                        onClick={() => handleQuantityChange(item.product_id, item.variant_id, -1)}
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
                        onClick={() => handleQuantityChange(item.product_id, item.variant_id, 1)}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="py-4">
                    {FomatVND(parseFloat(item.price * item.quantity).toFixed(0))}
                  </td>
                  <td className="py-4 text-red-500 cursor-pointer">
                    <button onClick={() => handleRemoveItem(item.product_id, item.variant_id)}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex flex-col flex-wrap content-end justify-end space-y-4 mt-4">
            <div className="text-lg">
              <span className="font-bold">Tổng tiền:</span>
              <span className="text-red-500 font-bold">
              {FomatVND(calculateSubtotal())}
              </span>
            </div>
            <div className='w-1/3'>
              <button className="bg-gray-300 text-gray-700 text-lg px-4 py-2 rounded mr-2 w-1/2">
                Tiếp tục mua hàng
              </button>
              <button
                className="bg-gray-600 hover:bg-gray-800 text-white text-lg px-4 py-2 rounded w-2/5"
                disabled={selectedItems.length === 0}
                onClick={handleCheckout}
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

export default Chekout;