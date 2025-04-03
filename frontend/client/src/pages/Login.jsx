import { useMutation } from "@tanstack/react-query";
import { Button, Divider, Form, Input, message } from "antd";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/header/Logo";
import Success from "../components/popupmodal/Success";
import instanceAxios from "../config/db";
import { login } from "../redux/AuthSide";

const Login = () => {
  const nav = useNavigate();
  const dispatch = useDispatch();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [googleLoginUrl, setGoogleLoginUrl] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Lấy URL đăng nhập Google
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/v1/customer/auth/social/google/redirect", {
      headers: new Headers({ accept: "application/json" }),
    })
      .then((response) => response.ok ? response.json() : Promise.reject("Lỗi lấy URL đăng nhập Google"))
      .then((data) => setGoogleLoginUrl(data.data.url))
      .catch((error) => {
        console.error("Error fetching Google login URL:", error);
        message.error("Không thể kết nối với dịch vụ đăng nhập Google");
      });
  }, []);

  useEffect(() => {
    const authTokens = document.cookie
      .split(";")
      .find((item) => item.includes("isLogin"));
    if (authTokens) {
      nav("/");
    }
  }, []);

  const mutation = useMutation({
    mutationFn: async (dataUser) => {
      return await instanceAxios.post(`/api/v1/customer/login`, dataUser);
    },
    onSuccess: (res) => {
      const { access_token, refresh_token, user, expires_at, expires_in } =
        res.data.data;

      dispatch(
        login({
          accessToken: access_token,
          refreshToken: refresh_token,
          user: {
            avatar: user.avatar,
            name: user.name,
            email: user.email,
            phone: user.phone,
          },
          expiresAt: expires_at, // Lưu thời gian hết hạn
          expiresIn: expires_in, // Lưu thời gian sống của token
        })
      );

      setSuccess(true);
      setTimeout(() => {
        nav("/");
        setSuccess(false);
      }, 2000);
    },
    onError: (err) => {
      setError(true);
      message.error(
        err.response?.data?.message ||
          "Đăng nhập thất bại, vui lòng thử lại sau."
      );
    },
  });

  const onFinish = (values) => {
    const { email, password } = values;

    const dataUser = {
      identifier: email,
      password: password,
    };

    mutation.mutate(dataUser);
  };

  // Xử lý đăng nhập Google
  const handleGoogleLogin = () => {
    if (!googleLoginUrl) {
      message.error("URL đăng nhập Google không khả dụng");
      return;
    }
    
    setGoogleLoading(true);
    
    // Lưu lại URL hiện tại để sau khi đăng nhập có thể quay lại
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    
    // Chuyển hướng đến trang đăng nhập Google
    window.location.href = googleLoginUrl;
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="hidden lg:flex w-1/2 bg-white items-center justify-center">
        <Logo />
        <img
          alt="A woman sitting on a chair wearing a plaid shirt, blue sweater, blue jeans, and a blue beanie"
          className="object-cover h-full w-full"
          height="800"
          src="https://storage.googleapis.com/a1aa/image/BJM5HnecVo1eRkFhTrM8QCVHciSRr2dkGQoKoh3BcUylzlHUA.jpg"
          width="600"
        />
      </div>

      <div className="flex flex-col justify-center w-full lg:w-1/2 p-8 lg:p-24 bg-white shadow-lg rounded-lg">
        <h2 className="text-3xl font-bold mb-2 text-gray-800">
          Chào mừng <span className="wave">👋</span>
        </h2>
        <p className="text-gray-600 mb-8">Đăng nhập tại đây</p>

        <Form layout="vertical" onFinish={onFinish} className="space-y-4">
          <Form.Item
            label={<span className="text-gray-700">Email / Số điện thoại</span>}
            name="email"
            rules={[
              {
                required: true,
                message: "Hãy nhập Email hoặc Số điện thoại của bạn!",
              },
              {
                validator: (_, value) => {
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  const phoneRegex = /^(0|\+84)[0-9]{9,11}$/;
                  if (!value || emailRegex.test(value) || phoneRegex.test(value)) {
                    return Promise.resolve();
                  }
                  return Promise.reject("Vui lòng nhập đúng định dạng Email hoặc Số điện thoại!");
                },
              },
            ]}
            className="w-full"
          >
            <Input
              placeholder="robertfox@example.com hoặc 0987654321"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-gray-700">Mật khẩu</span>}
            name="password"
            rules={[
              { required: true, message: "Hãy nhập mật khẩu của bạn!" },
              { min: 8, message: "Mật khẩu phải hơn 8 ký tự!" },
            ]}
            className="w-full"
          >
            <Input.Password
              placeholder="••••••••••••••"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </Form.Item>

          <Form.Item className="w-full">
            <div className="flex justify-between items-center w-full">
              <span>
                Chưa có tài khoản?{" "}
                <Link to={"/register"} className="text-gray-700">
                  Đăng ký
                </Link>
              </span>
              <Link to={`/forgot-password`} className="text-sm text-blue-600 hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full bg-black text-white py-2 rounded-lg hover:!bg-gray-800"
              loading={mutation.isPending}
            >
              Đăng nhập
            </Button>
          </Form.Item>

          <div className="grid grid-cols-5 items-center justify-items-center">
            <Divider className="col-span-2" /> <span>Hoặc</span> <Divider className="col-span-2" />
          </div>

          {/* Google login */}
          <Form.Item>
            <Button
              type="default"
              className="w-full bg-red-500 text-white py-2 rounded-lg hover:!bg-red-600 disabled:opacity-50 disabled:hover:!bg-gray-100 disabled:cursor-not-allowed"
              onClick={handleGoogleLogin}
              loading={googleLoading}
              disabled={!googleLoginUrl || googleLoading}
            >
              Đăng nhập bằng Google
            </Button>
          </Form.Item>
        </Form>
      </div>
      {success && <Success />}
    </div>
  );
};

export default Login;
