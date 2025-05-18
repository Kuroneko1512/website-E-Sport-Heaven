// src/components/Order/OrderItem.jsx
import { Modal } from "antd";
import ReviewForm from "./ReviewForm";
import FomatVND from "../../utils/FomatVND";
import { ORDER_STATUS, ORDER_STATUS_LABELS } from "../../constants/OrderConstants";

const OrderItem = ({
  order_items,
  customer_name,
  status,
  shipping_address,
  order_code,
  reviewModalVisible,
  setReviewModalVisible,
  selectedOrder,
  form,
  handleReviewSubmit,
  currentProductIndex,
  setCurrentProductIndex,
  reviewedProducts,
  calculateSubtotal,
  payment_status
}) => {
  const totalAmount = order_items.reduce((total, item) => total + calculateSubtotal(item), 0);

  const statusStyles = {
    [ORDER_STATUS.PENDING]: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
    [ORDER_STATUS.CONFIRMED]: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400",
    [ORDER_STATUS.PREPARING]: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    [ORDER_STATUS.READY_TO_SHIP]: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    [ORDER_STATUS.SHIPPING]: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    [ORDER_STATUS.DELIVERED]: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",
    [ORDER_STATUS.COMPLETED]: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",
    [ORDER_STATUS.RETURN_REQUESTED]: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300",
    [ORDER_STATUS.RETURN_PROCESSING]: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300",
    [ORDER_STATUS.RETURNED_COMPLETED]: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
    [ORDER_STATUS.RETURN_REJECTED]: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300",
    [ORDER_STATUS.CANCELLED]: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
  };

  return (
    <>
      <Modal
        title="Đánh giá sản phẩm"
        open={reviewModalVisible}
        onCancel={() => {
          setReviewModalVisible(false);
          form.resetFields();
        }}
        footer={[
          <button
            key="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => handleReviewSubmit(form.getFieldsValue())}
          >
            Đăng đánh giá
          </button>
        ]}
        width={800}
      >
        <div className="max-h-[500px] overflow-y-auto">
          {selectedOrder?.order_items?.map((item, index) => (
            <div key={index} className="mb-6 border-b pb-4">
              <div className="flex items-start pb-4">
                <img
                  alt="Product Image"
                  className="h-24 w-24 rounded-md mr-4"
                  src={`http://127.0.0.1:8000/storage/${item?.product?.image || item?.product_variant?.image}`}
                />
                <div>
                  <p className="font-bold text-lg">{item?.product?.name}</p>
                  {item?.product_variant?.product_attributes?.length > 0 && (
                    <p className="text-gray-600">
                      {item?.product_variant?.product_attributes.map((attr, index) => (
                        <span key={index}>
                          {attr?.attribute?.name}: {attr.attribute_value?.value}{" "}
                        </span>
                      ))}
                    </p>
                  )}
                </div>
              </div>
              <ReviewForm namePrefix={`product_${index}`} form={form} />
            </div>
          ))}
        </div>
      </Modal>

      <h3 className="bg-white flex justify-between border-b border-gray-200 items-center dark:bg-gray-800 pb-3">
        <div className="flex flex-col gap-2">
          <span>
            Mã đơn hàng: <strong>{order_code}</strong>
          </span>
          <span className="text-sm">{customer_name}</span>
          <span className="text-sm">{shipping_address.substring(0, 60)}...</span>
        </div>
        <div>
          <span className="mr-2 border-r pr-2">
            {payment_status === 1
              ? <span className="text-sm text-gray-600 dark:text-gray-400">Đã thanh toán</span>
              : <span className="text-sm text-red-600 dark:text-red-400">Chưa thanh toán</span>
            }
          </span>
          <span className={`px-2 py-1 rounded text-base ${statusStyles[status]}`}>
          {ORDER_STATUS_LABELS[status]}
        </span>
        </div>
      </h3>

      <div className="bg-white dark:bg-gray-800 flex gap-4 items-start border-b border-gray-200 dark:border-gray-700 pb-3">
        <div className="flex-1 grid grid-cols-3 gap-4">
          {order_items?.map((item, index) => (
            <div key={index} className="col-span-3 flex items-center justify-between space-y-3 pb-3">
              <div className="flex items-center space-x-4">
                <img
                  alt="Product Image"
                  className="h-16 w-16 rounded-md"
                  src={`http://127.0.0.1:8000/storage/${item?.product?.image || item?.product_variant?.image}`}
                />
                <div>
                  <p className="font-bold text-gray-900 dark:text-gray-200">{item?.product?.name}</p>
                  {item?.product_variant?.product_attributes?.length > 0 && (
                    <p className="text-gray-600 dark:text-gray-400">
                      {item?.product_variant?.product_attributes.map((attr, index) => (
                        <span key={index}>
                          {attr?.attribute?.name}: {attr.attribute_value?.value}{" "}
                        </span>
                      ))}
                    </p>
                  )}
                  <p className="text-gray-600 dark:text-gray-400">Số lượng: {item?.quantity}</p>
                </div>
              </div>
              <span className="text-right">
                <p className="text-lg text-gray-900 dark:text-gray-200">
                   {(item.product?.discount_percent > 0 ||
                    item.product_variant?.discount_percent > 0) && (
                    <span className="line-through text-gray-500 mr-2">
                      {FomatVND(item?.original_price)}
                    </span>
                  )}
                  <strong>{FomatVND(item?.price)}</strong>
                </p>
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default OrderItem;