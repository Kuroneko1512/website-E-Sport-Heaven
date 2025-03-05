import React, { useEffect, useState } from "react";
import instanceAxios from "../config/db";

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

const Order = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["order"],
    queryFn: async () => {
      const res = await instanceAxios.get("/api/v1/order/2");
      return res.data;
    },
  });
  console.log(data?.data?.order_items);

  // Calculate subtotal
  const calculateSubtotal = () => {
    return data?.data?.order_items
      .reduce(
        (total, item) =>
          total + parseFloat(item.product_variant.price) * item.quantity,
        0
      )
      .toFixed(2);
  };

  // Render error message if data fails to load

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading order data.</div>;
  }
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
              <span className="mt-2 text-sm">Order</span>
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-4">
            Estimated delivery: 22 Feb 2024
          </h2>
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
                {data?.data?.order_items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className="py-4">
                      <img
                        src={item.product_variant.image}
                        alt={item.product.name}
                        className="h-16"
                        width="50"
                        height="50"
                      />
                    </td>
                    <td className="py-4">
                      <div>
                        <h2 className="text-lg font-semibold">
                          {item.product.name}
                        </h2>
                        <p className="text-gray-600">
                          Size: {item.product_variant.sku}
                        </p>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-lg">
                        ${parseFloat(item.product_variant.price).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center border-gray-300 rounded w-fit">
                        <span className="px-4 py-1">{item.quantity}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-lg">
                        $
                        {(
                          parseFloat(item.product_variant.price) *
                          parseFloat(item.quantity)
                        ).toFixed(2)}
                      </span>
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
              <span className="text-lg font-bold">
                ${(parseFloat(calculateSubtotal()) + 5.0).toFixed(2)}
              </span>
            </div>
            <button className="bg-black text-white w-full py-3 rounded">
              {" "}
              <Link to={`/order`}>Place Order</Link>{" "}
            </button>
          </div>
        </div>
      </div>
      {/* review address + payment */}
      <div className="mb-8">
        <h2 className="font-semibold mb-4">Shipping Address</h2>
        <div className="flex justify-between  items-center">
          <div>
            <p className="font-semibold">Robert Fox</p>
            <p className="text-gray-600">
              4517 Washington Ave. Manchester, Kentucky 39495
            </p>
          </div>
          <i className="fas fa-edit text-gray-600"></i>
        </div>
      </div>
      <div className="flex-grow border-t border-gray-300 "></div>
      <div className="mb-8">
        <h2 className="font-semibold mb-4">Payment Method</h2>
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold">Debit Card (.... .... .... 89)</p>
          </div>
          <i className="fas fa-edit text-gray-600"></i>
        </div>
      </div>
    </main>
  );
};

export default Order;
