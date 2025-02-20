import React from 'react'

const PaymentMethod = () => {
  return (
    <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold mb-6">Payment Method</h1>
        <div className="flex flex-col lg:flex-row lg:space-x-12">
          <div className="flex-1">
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
                <div className="bg-white text-black border border-black rounded-full p-3">
                  <i className="fas fa-file-alt"></i>
                </div>
                <span className="mt-2 text-sm">Review</span>
              </div>
            </div>
            
          </div>
          <div className="w-full lg:w-1/3 mt-8 lg:mt-0">
            <div className="border border-gray-200 p-6 rounded-lg">
              <div className="flex justify-between mb-4">
                <span className="text-lg">Subtotal</span>
                <span className="text-lg">$200.00</span>
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
                <span className="text-lg font-bold">$205.00</span>
              </div>
            </div>
          </div>
        </div>
      </main>
  )
}

export default PaymentMethod