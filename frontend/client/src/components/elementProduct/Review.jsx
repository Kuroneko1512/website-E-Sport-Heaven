import { Button, Form, Input, Rate, Typography } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import React, { useState } from 'react'

const datareviews = [
  {
    id: 1,
    name: "Mark Williams",
    profilePic: "https://storage.googleapis.com/a1aa/image/lVaG3OqMK5GaSouNStIkQdtyMf8qhjTQ3QEyPm1wZs0.jpg",
    rating: 5,
    reviewText:
      "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.",
    date: "June 05, 2023",
  },
  {
    id: 2,
    name: "Alexa Johnson",
    profilePic: "https://storage.googleapis.com/a1aa/image/UiZUA1TqEwL5U7qYvuS93sAOuwkHYPQJvOyJnFB3uMY.jpg",
    rating: 5,
    reviewText:
      "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.",
    date: "June 05, 2023",
  },
];

const StarRating = ({ rating }) => {
  return (
    <div className="ml-2 text-yellow-500">
      {[...Array(5)].map((_, index) => (
        <i key={index} className={`fas fa-star ${index < rating ? "text-yellow-500" : "text-gray-300"}`}></i>
      ))}
    </div>
  );
};

const Review = () => {

  const [form] = Form.useForm();
  const onFinish = (value) => {
    console.log("Submitted Review:", value);
    // Xử lý logic gửi dữ liệu tại đây
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
      {datareviews.map((review) => (
        <div key={review.id} className="mb-6">
          <div className="flex items-start pb-4 mb-4 border-b-2">
            <img
              src={review.profilePic}
              alt={`Profile picture of ${review.name}`}
              className="w-12 h-12 rounded-full mr-4"
              width="50"
              height="50"
            />
            <div>
              <div className="flex flex-col items-start mb-1">
                <span className="font-semibold">{review.name}</span>
                <StarRating rating={review.rating} />
              </div>
              <p className="text-sm text-gray-600">{review.reviewText}</p>
              <p className="text-xs text-gray-500 mt-2">
                Review by <b className="text-gray-700">Sport Heaven</b> Posted on
                <span className="text-gray-700 font-bold"> {review.date}</span>
              </p>
            </div>
          </div>
        </div>
      ))}
      <div className="mt-10">
        <Form layout="vertical" onFinish={onFinish} form={form}>
      <Typography.Title level={2}>Add your Review</Typography.Title>

      {/* Đánh giá sao */}
      <div className="mt-4">
        <Typography.Text strong>Your Rating</Typography.Text>
        <Form.Item name="rate" rules={[{ required: true, message: 'Please input your rate!' }]}>
          <Rate />
        </Form.Item>
        
      </div>

      {/* Input nhập tên */}
      <div className="mt-4">
      <Typography.Text strong>Name</Typography.Text>
        <Form.Item name="name" rules={[{ required: true, message: 'Please input your name!' }]}>
        <Input
          placeholder="Enter Your Name"
        />
        </Form.Item>
      </div>

      {/* Textarea nhập đánh giá */}
      <div className="mt-4">
        <Typography.Text strong>Your Review</Typography.Text>
        <Form.Item name="review" rules={[{ required: true, message: 'Please input your review!' }]}>
        <TextArea
          rows={4}
          placeholder="Enter Your Review"
        />
        </Form.Item>
      </div>

      {/* Nút Submit */}
      <Button 
        type="primary" 
        htmlType='submit'
        className="mt-4 bg-black text-white" 
      >
        Submit
      </Button>
      </Form>
    </div>
    </div>
  );
}

export default Review