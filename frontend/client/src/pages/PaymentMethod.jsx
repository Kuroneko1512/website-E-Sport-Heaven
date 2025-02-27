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
            <h2 className="text-xl font-semibold mb-4">Select a payment method</h2>
            <div className="space-y-4">
              <div>
                <input
                  defaultChecked
                  className="mr-2"
                  id="debit-credit"
                  name="payment-method"
                  type="radio"
                />
                <label className="font-semibold" htmlFor="debit-credit">
                  Debit/Credit Card
                </label>
              </div>
              <div className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700"
                    htmlFor="card-number"
                  >
                    Card Number
                  </label>
                  <input
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    id="card-number"
                    type="text"
                    placeholder="Enter card number"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700"
                    htmlFor="card-name"
                  >
                    Card Name
                  </label>
                  <input
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    id="card-name"
                    type="text"
                    placeholder="Enter card name"
                  />
                </div>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label
                      className="block text-sm font-medium text-gray-700"
                      htmlFor="expiry-date"
                    >
                      Expiry Date
                    </label>
                    <input
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      id="expiry-date"
                      type="text"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div className="flex-1">
                    <label
                      className="block text-sm font-medium text-gray-700"
                      htmlFor="cvv"
                    >
                      CVV
                    </label>
                    <input
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      id="cvv"
                      type="text"
                      placeholder="CVV"
                    />
                  </div>
                </div>
                <button className="bg-black text-white px-4 py-2 rounded w-1/2">
                  Add Card
                </button>
              </div>
              <div>
                <input
                  className="mr-2"
                  id="google-pay"
                  name="payment-method"
                  type="radio"
                />
                <label className="font-semibold" htmlFor="google-pay">
                  Google Pay
                </label>
              </div>
              <div>
                <input
                  className="mr-2"
                  id="paypal"
                  name="payment-method"
                  type="radio"
                />
                <label className="font-semibold" htmlFor="paypal">
                  Paypal
                </label>
              </div>
              <div>
                <input
                  className="mr-2"
                  id="cash-on-delivery"
                  name="payment-method"
                  type="radio"
                />
                <label className="font-semibold" htmlFor="cash-on-delivery">
                  Cash on Delivery
                </label>
              </div>
              <button className="bg-black text-white px-4 py-2 rounded w-1/2 mt-4">
                Continue
              </button>
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