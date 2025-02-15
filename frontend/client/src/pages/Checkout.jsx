import React, { useState } from 'react';
const Checkout = () => {
    const [cartItems, setCartItems] = useState([
        {
          id: 1,
          name: 'Girls Pink Moana Printed Dress',
          size: 'S',
          price: 80.00,
          quantity: 1,
          image: 'https://storage.googleapis.com/a1aa/image/PeMwLRcbAF2jMKYoxv8f536TvriyOFSdHio1E9fYTff1P85gC.jpg'
        },
        {
          id: 2,
          name: 'Women Textured Handheld Bag',
          size: 'Regular',
          price: 80.00,
          quantity: 1,
          image: 'https://storage.googleapis.com/a1aa/image/uOOMvHgu0HY1BVqNKTeAipd3h8Fe80XsMciSwt7Xfqd3DfcQB.jpg'
        },
        {
          id: 3,
          name: 'Tailored Cotton Casual Shirt',
          size: 'M',
          price: 40.00,
          quantity: 1,
          image: 'https://storage.googleapis.com/a1aa/image/NUjFXvMAo2roPRTyTLVg2y6vX27s14bfajjCi3EElMn7wnDKA.jpg'
        }
      ]);
      //Thay doi so luong san pham
      const handleQuantityChange = (id, delta) => {
      
        setCartItems(cartItems.map(item => 
          item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
        ));
      };
      //Xoa san pham
      const handleRemoveItem = (id) => {
        if (window.confirm('Are you sure you want to remove this item?')) {
          setCartItems(cartItems.filter(item => item.id !== id));
        }
        
      }; 
      //Tinh tong tien
      const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
      };
  return (
    <div className="bg-white text-gray-800">
      
      {/* Main Content */}
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
              {cartItems.map(item =>(
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="py-4">
                  <img
                        src={item.image}
                        alt={item.name}
                        className="h-16"
                        width="50"
                        height="50"
                      />
                  </td>
                  <td className="py-4">
                    <div>
                    <h2 className="text-lg font-semibold">{item.name}</h2>
                    <p className="text-gray-600">Size: {item.size}</p>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="text-lg">${item.price.toFixed(2)}</span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center border border-gray-300 rounded w-fit">
                      <button className="px-2 py-1" onClick={()=> handleQuantityChange(item.id, -1)}>−</button>
                      <span className="px-4 py-1">{item.quantity}</span>
                      <button className="px-2 py-1" onClick={()=> handleQuantityChange(item.id, 1)}>+</button>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="text-lg">${(item.price * item.quantity).toFixed(2)}</span>
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
                  value="FLAT50"
                />
                <button className="bg-black text-white px-4 py-2 rounded-r">Apply</button>
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
            <button className="bg-black text-white w-full py-3 rounded">Proceed to Checkout</button>
          </div>
        </div>
      </main>
      
    </div>
  );
};

export default Checkout;