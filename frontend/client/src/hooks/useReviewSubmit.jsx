// src/hooks/useReviewSubmit.js
import { message } from "antd";
import Cookies from "js-cookie";
import instanceAxios from "../config/db";

const useReviewSubmit = (form, selectedOrder, setReviewModalVisible) => {
  const handleReviewSubmit = async () => {
    try {
      // Validate all forms first
      const values = form.getFieldsValue();
      const errors = [];

      selectedOrder.order_items.forEach((item, index) => {
        if (!values[`product_${index}_rating`]) {
          errors.push(`Vui lòng đánh giá sản phẩm ${item.product?.name}`);
        }
        if (!values[`product_${index}_comment`]) {
          errors.push(
            `Vui lòng nhập đánh giá cho sản phẩm ${item.product?.name}`
          );
        }
      });

      if (errors.length > 0) {
        message.error(errors.join("\n"));
        return;
      }

      // Submit all reviews
      const user = JSON.parse(Cookies.get("user"));
      const reviewPromises = selectedOrder.order_items.map((item, index) => {
        const productId = item.product_id || item.product_variant?.product_id;
        const reviewData = {
          images: user.avatar,
          title: user.name,
          rating: values[`product_${index}_rating`],
          comment: values[`product_${index}_comment`],
        };
        return instanceAxios.post(`/api/v1/customer/review`, {
          product_id: productId,
          ...reviewData,
        });
      });

      message.loading("Đang gửi đánh giá...", 0);
      await Promise.all(reviewPromises);
      message.destroy();
      message.success("Đã gửi đánh giá thành công");
      form.resetFields();
      setReviewModalVisible(false);
    } catch (error) {
      message.destroy();
      message.error("Có lỗi xảy ra khi gửi đánh giá");
      console.error(error);
    }
  };

  return { handleReviewSubmit };
};

export default useReviewSubmit;