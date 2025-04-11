import { Form, Input, Rate, Typography, Button, message } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useState } from "react";

const ReviewForm = ({ 
  form, 
  productId, 
  productName,
  onSubmitReview,
  namePrefix 
}) => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();
      const reviewData = {
        rating: values[`${namePrefix}_rating`],
        comment: values[`${namePrefix}_comment`],
        title: values[`${namePrefix}_title`]
      };
      
      const success = await onSubmitReview(reviewData);
      if (success) {
        message.success(`Đã gửi đánh giá cho ${productName}`);
      }
    } catch (error) {
      console.error("Review submission error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form layout="vertical" form={form}>
      <Typography.Title level={3}>Đánh giá {productName}</Typography.Title>

      {/* Đánh giá sao */}
      <div className="mt-4">
        <Typography.Text strong>Đánh giá</Typography.Text>
        <Form.Item
          name={`${namePrefix}_rating`}
          rules={[{ required: true, message: "Vui lòng chọn số sao đánh giá!" }]}
        >
          <Rate />
        </Form.Item>
      </div>

      {/* Input nhập tên */}
      <div className="mt-4">
        <Typography.Text strong>Tên người dùng</Typography.Text>
        <Form.Item
          name={`${namePrefix}_title`}
          rules={[{ required: true, message: "Vui lòng nhập tên người dùng!" }]}
        >
          <Input placeholder="Nhập tên người dùng" />
        </Form.Item>
      </div>

      {/* Textarea nhập đánh giá */}
      <div className="mt-4">
        <Typography.Text strong>Nhập đánh giá của bạn</Typography.Text>
        <Form.Item
          name={`${namePrefix}_comment`}
          rules={[{ required: true, message: "Vui lòng nhập đánh giá!" }]}
        >
          <TextArea rows={4} placeholder="Nhập đánh giá" />
        </Form.Item>
      </div>

      <Form.Item className="hidden">
        <Button 
          type="primary" 
          onClick={handleSubmit}
          loading={submitting}
          disabled={submitting}
        >
          Đăng đánh giá
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ReviewForm;