import React, { useState } from 'react'

const Review = () => {
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
          const calculateSubtotal = () => {
            return cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
          };
  return (
    <main className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-semibold mb-6">Payment Method</h1>
    <div className="flex flex-col lg:flex-row lg:space-x-12">
      <div className="flex-1">
      {/* procedure */}
        <div className="flex items-center w-full max-w-4xl">
          <div className="flex flex-col items-center">
            <div className="bg-black text-white rounded-full p-3">
              <i className="fas fa-home"></i>
            </div>
            <span className="mt-2 text-sm">Address</span>
          </div>
          <div className="flex-grow border-t border-black mx-3"></div>
          <div className="flex flex-col items-center">
            <div className="bg-black text-white border border-black rounded-full p-3">
              <i className="fas fa-credit-card"></i>
            </div>
            <span className="mt-2 text-sm">Payment Method</span>
          </div>
          <div className="flex-grow border-t border-black mx-3"></div>
          <div className="flex flex-col items-center">
            <div className="bg-black text-white border border-black rounded-full p-3">
              <i className="fas fa-file-alt"></i>
            </div>
            <span className="mt-2 text-sm">Review</span>
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-4">Estimated delivery:  22 Feb 2024</h2>
        <div className="space-y-4">
        <table className="w-full">
          <thead>
            <tr className="text-left">
              <th className="pb-4">Products</th>
              <th className="pb-4">Name</th>
              <th className="pb-4">Price</th>
              <th className="pb-4">Quantity</th>
              <th className="pb-4">Subtotal</th>
              <th className="pb-4"></th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map(item => (
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
                  <div className="flex items-center  border-gray-300 rounded w-fit">
                   
                    <span className="px-4 py-1">{item.quantity}</span>
                   
                  </div>
                </td>
                <td className="py-4">
                  <span className="text-lg">${(item.price * item.quantity).toFixed(2)}</span>
                </td>
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        
      </div>

      {/* Order Summary */}
      <div className="w-full lg:w-1/3 mt-8 lg:mt-0">
        <div className="border border-gray-200 p-6 rounded-lg">
          <div className="flex justify-between mb-4">
            <span className="text-lg">Subtotal</span>
            <span className="text-lg">${calculateSubtotal()}</span>
          </div>
          <div className="flex-grow border-t border-black"></div>
          <div className="mb-4">
            <label
              className="block text-gray-600 mb-2"
              htmlFor="discount-code"
            >
              Enter Discount Code
            </label>
            <div className="flex">
              <input
                className="border border-gray-300 rounded-l px-4 py-2 w-full"
                id="discount-code"
                type="text"
                placeholder="FLAT50"
              />
              <button className="bg-black text-white px-4 py-2 rounded-r">
                Apply
              </button>
            </div>
          </div>
          <div className="flex justify-between mb-4">
            <span className="text-lg">Delivery Charge</span>
            <span className="text-lg">$5.00</span>
          </div>
          <div className="flex-grow border-t border-black"></div>
          <div className="flex justify-between mb-4">
            <span className="text-lg font-bold">Grand Total</span>
            <span className="text-lg font-bold">${(parseFloat(calculateSubtotal()) + 5.00).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  </main>
  )
}

export default Review