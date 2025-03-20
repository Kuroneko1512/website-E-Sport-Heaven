import React, { useEffect, useState } from "react";
import { Form, Input, Button, Checkbox, message } from "antd";
import Logo from "../components/header/Logo";
import Success from "../components/popupmodal/Success";
import Error from "../components/popupmodal/Error";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../redux/AuthSide";
import instanceAxios from "../config/db";
import axios from "axios";

const Login = () => {
  const nav = useNavigate();
  const dispatch = useDispatch();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  useEffect(()=> {
    const authTokens = document.cookie.split(";").find((item) => item.includes("isLogin"));
    if (authTokens) {
      nav("/");
    }
  },[])

  const mutation = useMutation({
    mutationFn: async (dataUser) => {
      return await axios.post(`http://localhost:3000/login`, dataUser);
    },
    onSuccess: async () => {
      dispatch(login());
      setSuccess(true);
      // message.success("Login successful!");
      setTimeout(() => {
        nav("/");
        setSuccess(false);
      }, 2000);
    },
    onError: async () => {
      setError(true);
      setTimeout(() => {
        setError(false);
      }, 100);
      // message.error("Login failed. Please try again.");
    },
  });

  const onFinish = (values) => {
    mutation.mutate(values);
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
            label={<span className="text-gray-700">Email</span>}
            name="email"
            rules={[
              { required: true, message: "Hãy nhập Email của bạn!" },
              { type: "email", message: "Không đúng định dạng Email!" },
            ]}
            className="w-full"
          >
            <Input
              placeholder="robertfox@example.com"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-gray-700">Mật khẩu</span>}
            name="password"
            rules={[
              { required: true, message: "Please enter your password!" },
              { min: 8, message: "Mật khẩu phải hơn 8 ký tự!" },
            ]}
            className="w-full"
          >
            <Input.Password
              placeholder="••••••••••••••"
              // visibilityToggle={{ visible: !hidden, onVisibleChange: setHidden }}
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
              <Link className="text-sm text-blue-600 hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full bg-black text-white py-2 rounded-lg  hover:!bg-gray-800"
              loading={mutation.isPending}
            >
              Đăng ký
            </Button>
          </Form.Item>
        </Form>
      </div>
      {success && <Success />}
      {error && <Error />}
    </div>
  );
};

export default Login;
