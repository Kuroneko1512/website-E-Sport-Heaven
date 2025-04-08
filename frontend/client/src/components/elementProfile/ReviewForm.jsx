import { Form, Input, Rate, Typography, Button } from "antd";
import TextArea from "antd/es/input/TextArea";

const ReviewForm = ({ onFinish, form }) => {
  return (
    <Form layout="vertical" onFinish={onFinish} form={form}>
      <Typography.Title level={3}>Thêm đánh giá của bạn</Typography.Title>

      {/* Đánh giá sao */}
      <div className="mt-4">
        <Typography.Text strong>Đánh giá</Typography.Text>
        <Form.Item
          name="rating"
          rules={[{ required: true, message: "Please input your rate!" }]}
        >
          <Rate />
        </Form.Item>
      </div>

      {/* Input nhập tên */}
      <div className="mt-4">
        <Typography.Text strong>Tên người dùng</Typography.Text>
        <Form.Item
          name="title"
          rules={[{ required: true, message: "Please input title!" }]}
        >
          <Input placeholder="Nhập tên người dùng" />
        </Form.Item>
      </div>

      {/* Textarea nhập đánh giá */}
      <div className="mt-4">
        <Typography.Text strong>Nhập đánh giá của bạn</Typography.Text>
        <Form.Item
          name="comment"
          rules={[{ required: true, message: "Please input your review!" }]}
        >
          <TextArea rows={4} placeholder="Nhập đánh giá" />
        </Form.Item>
      </div>

      {/* Nút Submit */}
      <Button
        type="primary"
        htmlType="submit"
        className="mt-4 bg-black text-white"
      >
        Đăng
      </Button>
    </Form>
  );
};

export default ReviewForm;
