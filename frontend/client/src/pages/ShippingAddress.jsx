import React from 'react'

const ShippingAddress = () => {
  return (
    <main className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Shipping Address</h1>
          <div className="flex flex-col lg:flex-row lg:space-x-8">
            <div className="flex items-center w-full max-w-4xl">
              <div className="flex flex-col items-center">
                <div className="bg-black text-white rounded-full p-3">
                  <i className="fas fa-home"></i>
                </div>
                <span className="mt-2 text-sm">Address</span>
              </div>
              <div className="flex-grow border-t border-black mx-3"></div>
              <div className="flex flex-col items-center">
                <div className="bg-white text-black border border-black rounded-full p-3">
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
            <div className="border border-gray-200 p-6 rounded-lg">
              <div className="flex justify-between mb-4">
                <span className="text-lg">Subtotal</span>
                <span className="text-lg">$200.00</span>
              </div>
              <div className="flex-grow border-t border-black"></div>
              <div className="mb-4">
                <label className="block text-gray-600 mb-2" htmlFor="discount-code">
                  Enter Discount Code
                </label>
                <div className="flex">
                  <input
                    className="border border-gray-300 rounded-l px-4 py-2 w-full"
                    id="discount-code"
                    type="text"
                    value="FLAT50"
                  />
                  <button className="bg-black text-white px-4 py-2 rounded-r">Apply</button>
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
          <div className="w-full max-w-lg p-2">
            <h1 className="text-2xl font-bold mb-6">Add a new address</h1>
            <form>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Name
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="name"
                  type="text"
                  placeholder="Enter Name"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mobile">
                  Mobile Number
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="mobile"
                  type="text"
                  placeholder="Enter Mobile Number"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="province">
                  Province/city
                </label>
                <div className="relative">
                  <select
                    className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                    id="province"
                  >
                    <option>Select Province/city</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <i className="fas fa-chevron-down"></i>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="district">
                  District
                </label>
                <div className="relative">
                  <select
                    className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                    id="district"
                  >
                    <option>Select District</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <i className="fas fa-chevron-down"></i>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ward">
                  Ward/town
                </label>
                <div className="relative">
                  <select
                    className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                    id="ward"
                  >
                    <option>Select Ward/town</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <i className="fas fa-chevron-down"></i>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="specific-address">
                  Specific address
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="specific-address"
                  type="text"
                  placeholder="Enter Specific address"
                />
              </div>
              <div className="mb-4 flex items-center">
                <input className="mr-2 leading-tight" type="checkbox" id="default-address" />
                <label className="text-sm" htmlFor="default-address">
                  Use as my default address
                </label>
              </div>
              <div className="flex items-center">
                <button
                  className="bg-black text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="button"
                >
                  Add New Address
                </button>
              </div>
            </form>
          </div>
        </main>
  )
}

export default ShippingAddress