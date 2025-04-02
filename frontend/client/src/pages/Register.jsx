import React, { useState } from 'react';
import { Form, Input, Button, message, Checkbox } from 'antd';
import Logo from '../components/header/Logo';
import Success from '../components/popupmodal/Success';
import Error from '../components/popupmodal/Error';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import instanceAxios from '../config/db';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';

const Register = () => {
    const nav = useNavigate();
    const dispatch = useDispatch();
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);

    const mutation = useMutation(
        {
            mutationFn: async (dataUser) => {
            return await axios.post("http://localhost:3000/register", dataUser);
        },
        
            onSuccess: () => {
               
                setSuccess(true);
                // message.success("Registration successful! Redirecting...");
                setTimeout(() => nav('/login'), 2000);
            },
            onError: (err) => {
                setError(true);
                // message.error(err.response?.data?.message || "Registration failed. Please try again.");
                setTimeout(() => setError(false), 2000);
            }
        }
        
    );

    const onFinish = (values) => mutation.mutate(values);

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
                <h2 className="text-3xl font-bold mb-2 text-gray-800">Chào mừng <span className="wave">👋</span></h2>
                <p className="text-gray-600 mb-8">Đăng ký tại đây</p>
                
                <Form layout="vertical" onFinish={onFinish} className="space-y-4">
            <Form.Item
                label={<span className="text-gray-700">Tên</span>}
                name="fullname"
                rules={[{ required: true, message: 'Please enter your first name!' }]}
            >
                <Input placeholder="Robert" className="px-4 py-2 border rounded-md" />
            </Form.Item>
            
            <Form.Item
                label={<span className="text-gray-700">Email</span>}
                name="email"
                rules={[{ required: true, type: 'email', message: 'Invalid email format!' }]}
            >
                <Input placeholder="roberrfox@example.com" className="px-4 py-2 border rounded-md" />
            </Form.Item>
            
            <Form.Item
                label={<span className="text-gray-700">Mật khẩu</span>}
                name="password"
                rules={[{ required: true, message: 'Please enter your password!' }, { min: 8, message: 'Password must be at least 8 characters!' }]}
            >
                <Input.Password
                    placeholder="••••••••"
                    className="px-4 py-2 border rounded-md"
                    iconRender={visible => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                    visibilityToggle
                />
            </Form.Item>
            
            <Form.Item
                label={<span className="text-gray-700">Nhập lại Mật khẩu</span>}
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                    { required: true, message: 'Please confirm your password!' },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Passwords do not match!'));
                        },
                    })
                ]}
            >
                <Input.Password
                    placeholder="••••••••"
                    className="px-4 py-2 border rounded-md"
                    iconRender={visible => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                    visibilityToggle
                />
            </Form.Item>
            
            <Form.Item name="terms" valuePropName="checked" rules={[{ required: true, message: 'You must agree to the Terms & Conditions!' }]}
            >
                <Checkbox>Tôi đồng ý với các <span className="font-bold">điều khoản & điều kiện</span></Checkbox>
            </Form.Item>
            
            <Form.Item>
                <Button type="primary" htmlType="submit" className="w-full bg-black text-white py-2 rounded-lg  hover:!bg-gray-800">
                    Đăng ký
                </Button>
            </Form.Item>
        </Form>

                <p className="text-center text-gray-600 text-sm mt-6">Đã có tài khoản? <Link to="/login" className="text-blue-600">Đăng nhập.</Link></p>
            </div>
            
            {success && <Success />}
            {error && <Error />}
        </div>
    );
};

export default Register;