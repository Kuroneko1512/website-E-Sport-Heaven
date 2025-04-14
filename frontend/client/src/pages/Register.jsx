import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Button, Checkbox, Form, Input } from "antd";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/header/Logo";
import Error from "../components/popupmodal/Error";
import Success from "../components/popupmodal/Success";
import instanceAxios from "../config/db";
import { login } from "../redux/AuthSide";

const Register = () => {
  const nav = useNavigate();
  const dispatch = useDispatch();
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: async (dataUser) => {
      return await instanceAxios.post("api/v1/customer/register", dataUser);
    },

    onSuccess: (res) => {
      const { access_token, refresh_token, user, expires_at, expires_in } =
        res.data.data;

      dispatch(
        login({
          accessToken: access_token,
          refreshToken: refresh_token,
          user: {
            customerId: user.id,
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
        nav("/"); // hoặc '/home'
        setSuccess(false);
      }, 2000);
    },
    onError: (err) => {
      setError(true);
      message.error(err.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại sau.");
    //   setTimeout(() => setError(false), 200);
    },
  });

  const onFinish = (values) => {
    const { name, email, password, confirmPassword } = values;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(0|\+84)[0-9]{9,11}$/;

    const isEmail = emailRegex.test(email);
    const isPhone = phoneRegex.test(email);

    const dataUser = {
      email: isEmail ? email : "",
      phone: isPhone ? email : "",
      name: name.trim(),
      password: password,
      password_confirmation: confirmPassword,
    };

    mutation.mutate(dataUser);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="hidden lg:flex w-1/2 bg-white items-center justify-center relative overflow-hidden">
        <Logo />
        <img
          alt="A woman sitting on a chair"
          className="object-cover h-full w-full"
          src="https://storage.googleapis.com/a1aa/image/7RfxLJiLxawifEFYNzH63i75ezQXds0tO0vgPKgB0S4OxLPoA.jpg"
        />
      </div>

      <div className="flex flex-col justify-center w-full lg:w-1/2 p-8 lg:p-24 bg-white shadow-lg rounded-lg">
        <h2 className="text-3xl font-bold mb-2 text-gray-800">
          Chào mừng <span className="wave">👋</span>
        </h2>
        <p className="text-gray-600 mb-8">Đăng ký tại đây</p>

        <Form layout="vertical" onFinish={onFinish} className="space-y-4">
          {/* <Form.Item
            label={<span className="text-gray-700">Họ</span>}
            name="firstname"
            rules={[{ required: true, message: "Hãy nhập họ của bạn!" }]}
          >
            <Input
              placeholder="Robert"
              className="px-4 py-2 border rounded-md"
            />
          </Form.Item> */}

          <Form.Item
            label={<span className="text-gray-700">Tên người dùng</span>}
            name="name"
            rules={[{ required: true, message: "Hãy nhập tên người dùng của bạn!" }]}
          >
            <Input placeholder="Fox" className="px-4 py-2 border rounded-md" />
          </Form.Item>

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
                  if (
                    !value ||
                    emailRegex.test(value) ||
                    phoneRegex.test(value)
                  ) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    "Vui lòng nhập đúng định dạng Email hoặc Số điện thoại!"
                  );
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
              { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" },
            ]}
          >
            <Input.Password
              placeholder="••••••••"
              className="px-4 py-2 border rounded-md"
              iconRender={(visible) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
              visibilityToggle
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-gray-700">Nhập lại Mật khẩu</span>}
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Hãy nhập lại mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Mật khẩu không khớp!"));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="••••••••"
              className="px-4 py-2 border rounded-md"
              iconRender={(visible) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
              visibilityToggle
            />
          </Form.Item>

          <Form.Item
            name="terms"
            valuePropName="checked"
            rules={[
              {
                required: true,
                message: "Bạn phải đồng ý với các điều khoản!",
              },
            ]}
          >
            <Checkbox>
              Tôi đồng ý với các{" "}
              <span className="font-bold">điều khoản & điều kiện</span>
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={mutation.isPending}
              className="w-full bg-black text-white py-2 rounded-lg hover:!bg-gray-800"
            >
              Đăng ký
            </Button>
          </Form.Item>
        </Form>

        <p className="text-center text-gray-600 text-sm mt-6">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-blue-600">
            Đăng nhập.
          </Link>
        </p>
      </div>

      {success && <Success />}
    </div>
  );
};

export default Register;