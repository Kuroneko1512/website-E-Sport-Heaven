import { useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import instanceAxios from "../config/db";

const useReview = (productId) => {
  const queryClient = useQueryClient();

  const submitReview = async (values) => {
    try {
      const reviewData = { product_id: productId, ...values };
      await instanceAxios.post("/api/v1/customer/review", reviewData);
      
      // Refresh reviews data
      const updatedReviews = await instanceAxios.get(
        `/api/v1/customer/review-by-product/${productId}`
      );
      queryClient.setQueryData(["datareviews", productId], updatedReviews?.data);
      
      message.success("Đánh giá đã được gửi thành công!");
      return true;
    } catch (error) {
      message.error("Có lỗi xảy ra khi gửi đánh giá");
      console.error("Review submission error:", error);
      return false;
    }
  };

  return { submitReview };
};

export default useReview;
