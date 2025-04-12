import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, Rate, Typography } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useParams } from "react-router-dom";
import instanceAxios from "../../config/db";

const StarRating = ({ rating }) => {
  return (
    <div className="ml-2 text-yellow-500">
      {[...Array(5)].map((_, index) => (
        <i
          key={index}
          className={`fas fa-star ${
            index < rating ? "text-yellow-500" : "text-gray-300"
          }`}
        ></i>
      ))}
    </div>
  );
};

const Review = () => {
  const { id } = useParams();

  let { data: datareviews } = useQuery({
    queryKey: ["datareviews", id],
    queryFn: async () => {
      const res = await instanceAxios.get(`/api/v1/review-by-product/${id}`);
      return res?.data;
    },
  });

  const queryClient = useQueryClient();

  const [form] = Form.useForm();
  const onFinish = async (value) => {
    console.log("Submitted Review:", value);
    value = { product_id: id, ...value };
    await instanceAxios.post("/api/v1/review", value);

    const updatedReviews = await instanceAxios.get(
      `/api/v1/review-by-product/${id}`
    );
    queryClient.setQueryData(["datareviews", id], updatedReviews?.data);

    form.resetFields();
  };

  function DateTimeFormat(dateTime) {
    const formattedDate = new Date(dateTime).toLocaleString(); // This converts the datetime to a readable format

    return <>{formattedDate}</>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Đánh giá của khách hàng</h2>
      {datareviews?.data?.map((review) => (
        <div key={review.id} className="mb-6">
          <div className="flex items-start pb-4 mb-4 border-b-2">
            <img
              src={
                "https://storage.googleapis.com/a1aa/image/lVaG3OqMK5GaSouNStIkQdtyMf8qhjTQ3QEyPm1wZs0.jpg"
              }
              alt={`Profile picture of ${review.name}`}
              className="w-12 h-12 rounded-full mr-4"
              width="50"
              height="50"
            />
            <div>
              <div className="flex flex-col items-start mb-1">
                <span className="font-semibold">{review.title}</span>
                <StarRating rating={review.rating} />
              </div>
              <p className="text-sm text-gray-600">{review.comment}</p>
              <p className="text-xs text-gray-500 mt-2">
                Đánh giá bởi <b className="text-gray-700">{review.full_name}</b>{" "}
                Đăng lúc
                <span className="text-gray-700 font-bold">
                  {" "}
                  {DateTimeFormat(review.created_at)}
                </span>
              </p>
            </div>
          </div>
        </div>
      ))}
      <div className="mt-10">
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
      </div>
    </div>
  );
};

export default Review;