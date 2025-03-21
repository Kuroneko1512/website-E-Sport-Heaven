import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography } from 'antd';
import { LeftOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const ForgotPassword = () => {

    const nav = useNavigate();

  const onFinish = (values) => {
    console.log('Email gửi OTP:', values.email);
    // Xử lý gửi OTP ở đây

    // Chuyển hướng về trang nhập OTP
    nav('/otp-enter');
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
          <Link className="flex items-center mb-6" to="/login">
            <LeftOutlined />
            <span className="ml-2 text-gray-500">Trở lại</span>
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