import { LeftOutlined } from "@ant-design/icons";
import { Button, Form, Input, Space, Typography } from "antd";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Error from "../components/popupmodal/Error";
import { PasswordChangedSS } from "../components/popupmodal/PasswordChangedSS";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { login } from "../redux/AuthSide";

const { Title, Text } = Typography;

const OtpVerification = () => {
  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

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

  const handleSubmit = async () => {
    try {
      const otpValue = inputsRef.current.map((input) => input?.value || "").join("");
      console.log("OTP nhập vào:", otpValue);
      
      // Lấy email từ cookies
      const email = Cookies.get('otpEmail');
      if (!email) {
        throw new Error('Không tìm thấy email');
      }
  
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp: otpValue }),
      });
  
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'OTP không hợp lệ');
      }
  
      // Lưu thông tin vào Redux và cookies
      const dispatch = useDispatch();
      dispatch(login({
        accessToken: data.token,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        user: { email }
      }));
  
      // Xóa cookie OTP sau khi xác thực thành công
      Cookies.remove('otpEmail');
  
      setSuccess(true);
      setTimeout(() => {
        navigate("/reset-password");
        setSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Lỗi xác thực OTP:', error);
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
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
          <Space
            className="mb-6 cursor-pointer"
            onClick={() => navigate(-1)}
            align="center"
          >
            <LeftOutlined />
            <span className="ml-2 text-gray-500">Trở lại</span>
          </Space>

          <Title level={3}>Nhập OTP</Title>
          <Text type="secondary">
            Chúng tôi đã chia sẻ mã đến địa chỉ email đã đăng ký của bạn
          </Text>
          <div className="mt-2 mb-6 text-gray-500">robertfox@example.com</div>

          <Form onFinish={handleSubmit} className="flex flex-col">
            <Space size="middle" className="mb-6">
              {[...Array(6)].map((_, index) => (
                <Input
                name={`otp-${index}`}
                key={index}
                ref={(el) => (inputsRef.current[index] = el?.input)}
                maxLength={1}
                className="text-center text-2xl"
                style={{ width: 56, height: 56, borderRadius: 8 }}
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
              style={{ backgroundColor: "black" }}
            >
              Xác thực
            </Button>
          </Form>
        </div>
      </div>
      {success && <PasswordChangedSS />}
      {error && <Error />}
    </div>
  );
};

export default OtpVerification;