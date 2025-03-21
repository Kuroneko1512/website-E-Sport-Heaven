import React, { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, Typography, Space } from "antd";
import { LeftOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const OtpVerification = () => {
  const inputsRef = useRef([]);

  const handleInputChange = (index, e) => {
    const value = e.target.value;
    if (value.length === 1 && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1].focus();
    }

    if (index === inputsRef.current.length - 1 && value.length === 1) {
      handleSubmit();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputsRef.current[index - 1].focus();
      inputsRef.current[index - 1].value = "";
    }
  };

  const handleSubmit = () => {
    const otpValue = inputsRef.current.map((input) => input.value).join("");
    console.log("OTP nhập vào:", otpValue);
    // Call API verify here
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Image Section */}
      <div className="w-1/2 hidden md:block">
        <img
          alt="Person sitting in a chair with geometric light structures"
          className="w-full h-full object-cover"
          src="https://storage.googleapis.com/a1aa/image/QSkj2oGzfgx0OS7Ry9JiZcyvz74JmrH6L3n9fzEIp1FO8lHUA.jpg"
          width="800"
          height="1200"
        />
      </div>

      {/* Right Form Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white">
        <div className="max-w-md w-full p-8">
          <Link className="flex items-center mb-6" to="/forgot-password">
            <LeftOutlined />
            <span className="ml-2 text-gray-500">Trở lại</span>
          </Link>

          <Title level={3}>Enter OTP</Title>
          <Text type="secondary">
            Chúng tôi đã chia sẻ mã đến địa chỉ email đã đăng ký của bạn
          </Text>
          <div className="mt-2 mb-6 text-gray-500">robertfox@example.com</div>

          <Form onFinish={handleSubmit} className="flex flex-col">
            <Space size="middle" className="mb-6">
              {[...Array(6)].map((_, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputsRef.current[index] = el)}
                  maxLength={1}
                  className="text-center text-2xl"
                  style={{ width: 56, height: 56, borderRadius: 8 }}
                  onChange={(e) => handleInputChange(index, e)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  autoComplete="off"
                />
              ))}
            </Space>

            <Button
              type="primary"
              htmlType="submit"
              block
              style={{ backgroundColor: "black" }}
            >
              Xác thực
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
