import React from 'react'; 

const OrderItem = ({ product, status, price, buttons }) => {
  const statusStyles = {
    delivered: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
    inProcess: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300',
    cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  };

  return (
    <div className="bg-white dark:bg-gray-800 grid grid-cols-4 gap-4 items-center border-b border-gray-200 dark:border-gray-700 pb-3">
      <div className="col-span-2 space-y-3">
        <div className="flex items-center space-x-4">
          <img
            alt="Product Image"
            className="h-16 w-16 rounded-md"
            height="50"
            src={product.image}
            width="50"
          />
          <div>
            <p className="font-bold text-gray-900 dark:text-gray-200">{product.name}</p>
            <p className="text-gray-600 dark:text-gray-400">Size: {product.size}</p>
            <p className="text-gray-600 dark:text-gray-400">Quantity: {product.quantity}</p>
          </div>
        </div>
        <div className="flex items-center">
          <span className={`px-2 py-1 rounded text-sm ${statusStyles[status]}`}>
            {status === 'delivered' ? 'Delivered' : status === 'inProcess' ? 'In Process' : 'Cancelled'}
          </span>
          <p className="ml-2 text-gray-600 dark:text-gray-400">
            {status === 'delivered' ? 'Your product has been delivered' : 'Your product is in process'}
          </p>
        </div>
      </div>
      <div className="text-center col-span-1">
        <p className="font-bold text-lg text-gray-900 dark:text-gray-200">${price}</p>
      </div>
      <div className="col-span-1 flex flex-col space-y-2 items-end">
        {buttons.map((btn, index) => (
          <button
            key={index}
            className={`px-4 py-2 rounded-lg mt-2 ${btn.style} dark:border-gray-500 dark:text-gray-200`}
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
      buttons: [{ label: 'View Order', style: 'border border-black text-black dark:border-gray-500 dark:text-gray-200' }, { label: 'Write A Review', style: 'bg-black text-white dark:bg-gray-700 dark:text-gray-300' }],
    },
    {
      product: { image: 'https://storage.googleapis.com/a1aa/image/Ooq2sIv0TXamVjsWDwdWarVzsRVQtWFDPhReFnO9ydQ.jpg', name: 'Quần Short', size: 'M', quantity: 1 },
      status: 'inProcess',
      price: 80.00,
      buttons: [{ label: 'View Order', style: 'border border-black text-black dark:border-gray-500 dark:text-gray-200' }, { label: 'Cancel Order', style: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' }],
    },
    {
      product: { image: 'https://storage.googleapis.com/a1aa/image/Ooq2sIv0TXamVjsWDwdWarVzsRVQtWFDPhReFnO9ydQ.jpg', name: 'Quần Short', size: 'M', quantity: 1 },
      status: 'cancelled',
      price: 80.00,
      buttons: [{ label: 'View Order', style: 'border border-black text-black dark:border-gray-500 dark:text-gray-200' }, { label: 'Buy Again', style: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' }],
    },
  ];

  return (
    <div className="dark:bg-gray-800 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <input className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg p-2 w-1/2" placeholder="Tìm kiếm" type="text" />
        <button className="bg-black dark:bg-gray-700 text-white dark:text-gray-300 rounded-lg p-2 ml-2 flex items-center">
          Bộ Lọc
          <i className="fas fa-sliders-h ml-2" />
        </button>
      </div>
      <div className="space-y-6">
        {orders.map((order, index) => (
          <OrderItem key={index} {...order} />
        ))}
      </div>
    </div>
  );
};

export default MyOrder;