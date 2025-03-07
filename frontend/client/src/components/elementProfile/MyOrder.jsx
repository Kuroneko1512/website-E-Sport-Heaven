import React from 'react';

const OrderItem = ({ product, status, price, buttons }) => {
  const statusStyles = {
    delivered: 'bg-green-100 text-green-600',
    inProcess: 'bg-yellow-100 text-yellow-600',
    cancelled: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="bg-white grid grid-cols-4 gap-4 items-center border-b border-gray-200 pb-3">
      <div className="col-span-2 space-y-3">
        <div className="flex items-center space-x-4">
          <img
            alt="Product Image"
            className="h-16 w-16"
            height="50"
            src={product.image}
            width="50"
          />
          <div>
            <p className="font-bold">{product.name}</p>
            <p>Size: {product.size}</p>
            <p>Quantity: {product.quantity}</p>
          </div>
        </div>
        <div className="flex items-center">
          <span className={`px-2 py-1 rounded text-sm ${statusStyles[status]}`}>
            {status === 'delivered' ? 'Delivered' : status === 'inProcess' ? 'In Process' : 'Cancelled'}
          </span>
          <p className="ml-2">{status === 'delivered' ? 'Your product has been delivered' : 'Your product is in process'}</p>
        </div>
      </div>
      <div className="text-center">
        <p className="font-bold text-lg">${price}</p>
      </div>
      <div className="text-right">
        {buttons.map((btn, index) => (
          <button
            key={index}
            className={`px-4 py-2 rounded-lg mt-2 ${btn.style}`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const MyOrder = () => {
  const orders = [
    {
      product: { image: 'https://storage.googleapis.com/a1aa/image/Ooq2sIv0TXamVjsWDwdWarVzsRVQtWFDPhReFnO9ydQ.jpg', name: 'Quần Short', size: 'S', quantity: 1 },
      status: 'delivered',
      price: 80.00,
      buttons: [{ label: 'View Order', style: 'border border-black text-black' }, { label: 'Write A Review', style: 'bg-black text-white' }],
    },
    {
      product: { image: 'https://storage.googleapis.com/a1aa/image/Ooq2sIv0TXamVjsWDwdWarVzsRVQtWFDPhReFnO9ydQ.jpg', name: 'Quần Short', size: 'M', quantity: 1 },
      status: 'inProcess',
      price: 80.00,
      buttons: [{ label: 'View Order', style: 'border border-black text-black' }, { label: 'Cancel Order', style: 'bg-red-100 text-red-600' }],
    },
    {
      product: { image: 'https://storage.googleapis.com/a1aa/image/Ooq2sIv0TXamVjsWDwdWarVzsRVQtWFDPhReFnO9ydQ.jpg', name: 'Quần Short', size: 'M', quantity: 1 },
      status: 'cancelled',
      price: 80.00,
      buttons: [{ label: 'View Order', style: 'border border-black text-black' }, { label: 'Buy Again', style: 'bg-green-100 text-green-600' }],
    },
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <input className="border border-gray-300 rounded-lg p-2 w-1/2" placeholder="Search" type="text" />
        <button className="bg-black text-white rounded-lg p-2 ml-2 flex items-center">
          Filter
          <i className="fas fa-sliders-h ml-2" />
        </button>
      </div>
      <div className="space-y-6">
        {orders.map((order, index) => (
          <OrderItem key={index} {...order} />
        ))}
      </div>
    </>
  );
};

export default MyOrder;
