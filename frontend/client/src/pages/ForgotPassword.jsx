import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie';

const { Title, Paragraph } = Typography;

const ForgotPassword = () => {

    const nav = useNavigate();

  const onFinish = async (values) => {
    try {
      console.log('Email gửi OTP:', values.email);
      
      // Gọi API gửi OTP đến email
      // Backend cần triển khai endpoint: POST /api/auth/forgot-password
      // Request body: { email: string }
      // Response: { success: boolean, message?: string }
      const response = await fetch('/api/v1/customer/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: values.email }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gửi OTP thất bại');
      }

      // Lưu email vào cookies để xác thực
      Cookies.set('otpEmail', values.email, { expires: 1/24 }); // Expires in 1 hour
      
      // Chuyển hướng đến trang nhập OTP
      nav('/otp-enter');
    } catch (error) {
      console.error('Lỗi khi gửi OTP:', error);
      // TODO: Hiển thị thông báo lỗi cho người dùng
    }
  };

  return (
    <div className="flex h-screen">
      {/* Image Section */}
      <div className="w-1/2 h-full">
        <img
          alt="A person in a flowing yellow dress reaching up towards the sky with a background of blue sky and white clouds"
          className="w-full h-full object-cover"
          src="https://storage.googleapis.com/a1aa/image/QSkj2oGzfgx0OS7Ry9JiZcyvz74JmrH6L3n9fzEIp1FO8lHUA.jpg"
          width="800"
          height="1200"
        />
      </div>

      {/* Form Section */}
      <div className="w-1/2 flex items-center justify-center">
        <div className="w-3/4">
          <Link className="flex items-center text-gray-500 mb-6" to="/login">
            <LeftOutlined />
            <span className="ml-2">Trở lại</span>
          </Link>

          <Title level={2}>Quên mật khẩu</Title>
          <Paragraph className="text-gray-500 mb-6">
            Nhập địa chỉ email đã đăng ký của bạn. Chúng tôi sẽ gửi cho bạn một mã để đặt lại mật khẩu của bạn.
          </Paragraph>

          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' },
              ]}
            >
              <Input placeholder="Nhập email của bạn" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="bg-black w-full hover:bg-gray-800"
              >
                Gửi OTP
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;