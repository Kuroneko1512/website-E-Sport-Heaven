import React, { useState, useEffect } from 'react';
import instanceAxios from '../config/db';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

const Checkout = () => {
  const queryClient = useQueryClient();
  const [cartItems, setCartItems] = useState([]);
  const [discountCode, setDiscountCode] = useState('');

  // Fetch data using React Query
  const { data, isLoading, isError } = useQuery({
    queryKey: ['order'],
    queryFn: async () => {
      const res = await instanceAxios.get('/api/v1/order');
      return res.data;
    },
  });

  // Update cartItems when data changes
  useEffect(() => {
    if (data?.data) {
      setCartItems(data?.data.flatMap((item) => item.order_items));
    }
  }, [data]);

  // Handle quantity change
  const handleQuantityChange = (id, delta) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  // Handle removing item
  const handleRemoveItem = (id) => {
   
    if (window.confirm('Are you sure you want to remove this item?')) {
      setCartItems(prevItems => prevItems.filter(item => item.id !== id));
      
    }
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total+  parseFloat(item.product?.price) * parseFloat(item.quantity), 0).toFixed(2);
  };

  // Handle discount code application
  const handleApplyDiscount = () => {
    if (discountCode === 'FLAT50') {
      alert('Discount applied');
      // Apply discount logic here (e.g., reduce the total)
    } else {
      alert('Invalid discount code');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading order data.</div>;
  }

  return (
    <div className="bg-white text-gray-800 dark:bg-gray-800 dark:text-white m-10">
      <main className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2">
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="pb-4">Products</th>
                  <th className="pb-4"></th>
                  <th className="pb-4">Price</th>
                  <th className="pb-4">Quantity</th>
                  <th className="pb-4">Subtotal</th>
                  <th className="pb-4"></th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className="py-4">
                      {item.product?.image && (
                        <img
                          src={item.product.image}
                          alt={item.product.name || 'Product Image'}
                          className="h-16"
                          width="50"
                          height="50"
                        />
                      )}
                    </td>
                    <td className="py-4">
                      <div>
                        <h2 className="text-lg font-semibold">{item.product?.name || 'Product Name'}</h2>
                        <p className="text-gray-600">Size: {item.product?.sku || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-lg">${parseFloat(item.product?.price || 0).toFixed(2)}</span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center border border-gray-300 rounded w-fit">
                        <button className="px-2 py-1" onClick={() => handleQuantityChange(item.id, -1)}>
                          −
                        </button>
                        <span className="px-4 py-1">{item.quantity}</span>
                        <button className="px-2 py-1" onClick={() => handleQuantityChange(item.id, 1)}>
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-lg">${(parseFloat(item.product?.price) * parseFloat(item.quantity)).toFixed(2)}</span>
                    </td>
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
              <span className="text-lg">Subtotal</span>
              <span className="text-lg">${calculateSubtotal()}</span>
            </div>
            <div className="mb-4">
              <label className="block text-gray-600 mb-2" htmlFor="discount-code">
                Enter Discount Code
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="discount-code"
                  className="border border-gray-300 rounded-l px-4 py-2 w-full"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                />
                <button
                  className="bg-black text-white px-4 py-2 rounded-r"
                  onClick={handleApplyDiscount}
                >
                  Apply
                </button>
              </div>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-lg">Delivery Charge</span>
              <span className="text-lg">$5.00</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-lg font-bold">Grand Total</span>
              <span className="text-lg font-bold">${(parseFloat(calculateSubtotal()) + 5.00).toFixed(2)}</span>
            </div>
            <button className="bg-black text-white w-full py-3 rounded"> <Link to={`/address`}>Proceed to Checkout</Link> </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
