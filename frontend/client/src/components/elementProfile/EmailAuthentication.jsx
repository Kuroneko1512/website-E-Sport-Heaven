import { LeftOutlined } from "@ant-design/icons";
import { Button, Form, Input, Space, Typography } from "antd";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PasswordChangedSS } from "../popupmodal/PasswordChangedSS";
import Error from "../popupmodal/Error";

const { Title, Text } = Typography;

import { useEffect } from "react";

const EmailAuthentication = () => {
  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(30); // 30 giây đếm ngược

  useEffect(() => {
    if (resendDisabled) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendDisabled]);

  const handleInputChange = (index, e) => {
    const value = e.target.value;
    if (value.length === 1 && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1].focus();
    }

    if (index === inputsRef.current.length - 1 && value.length === 1) {
      setTimeout(() => handleSubmit(), 0);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputsRef.current[index - 1].focus();
      inputsRef.current[index - 1].value = "";
    }
  };

  const handleSubmit = () => {
    const otpValue = inputsRef.current
      .map((input) => input?.value || "")
      .join("");
    console.log("OTP nhập vào:", otpValue);
    // Call API verify here
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
    }, 2000);
  };

  const handleResendOTP = () => {
    console.log("Gửi lại OTP");
    setResendDisabled(true);
    setCountdown(30); // Reset thời gian đếm ngược
    // Gửi lại OTP qua API tại đây
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
        <Title
          level={3}
          className="text-center mb-4 text-gray-900 dark:text-gray-100"
        >
          Nhập OTP
        </Title>
        <Text
          type="secondary"
          className="block text-center mb-2 text-gray-600 dark:text-gray-400"
        >
          Chúng tôi đã gửi mã OTP đến địa chỉ email đã đăng ký của bạn
        </Text>
        <div className="text-center text-gray-500 dark:text-gray-400 font-medium mb-6">
          robertfox@example.com
        </div>

        <Form onFinish={handleSubmit} className="flex flex-col items-center">
          <Space size="middle" className="mb-6">
            {[...Array(6)].map((_, index) => (
              <Input
                name={`otp-${index}`}
                key={index}
                ref={(el) => (inputsRef.current[index] = el?.input)}
                maxLength={1}
                placeholder="•"
                className="text-center text-2xl border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-gray-400 focus:ring-black dark:focus:ring-gray-400"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 8,
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                }}
                onChange={(e) => handleInputChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                autoComplete="off"
                autoFocus={index === 0}
              />
            ))}
          </Space>

          <Button
            type="primary"
            htmlType="submit"
            block
            style={{
              backgroundColor: "black",
              borderColor: "black",
              height: 48,
              fontSize: 16,
            }}
            className="dark:bg-gray-700 dark:border-gray-700 dark:hover:bg-gray-600 mb-4"
          >
            Xác thực
          </Button>

          <Button
            type="default"
            block
            style={{
              backgroundColor: resendDisabled ? "gray" : "white",
              borderColor: resendDisabled ? "gray" : "black",
              color: resendDisabled ? "white" : "black",
              height: 48,
              fontSize: 16,
            }}
            className={`dark:bg-gray-700 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 ${
              resendDisabled ? "cursor-not-allowed" : ""
            }`}
            onClick={handleResendOTP}
            disabled={resendDisabled}
          >
            {resendDisabled ? `Gửi lại OTP (${countdown}s)` : "Gửi lại OTP"}
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default EmailAuthentication;
