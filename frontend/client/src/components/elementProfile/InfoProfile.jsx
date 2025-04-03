import {
  CameraOutlined,
  EditOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, Modal, Select, Upload, message, DatePicker } from "antd";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import instanceAxios from "../../config/db";

const { Option } = Select;

const InfoProfile = () => {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();
  const user = JSON.parse(Cookies.get("user"));

  const { data: userData, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await instanceAxios.get("/api/v1/customer/profile");
      return res?.data?.data;
    },
    onError: () => {
      message.error("Không thể tải thông tin hồ sơ, vui lòng thử lại.");
    },
  });

  useEffect(() => {
    if (userData) {
      const initial = {
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
        avatar: user?.avatar,
        firstname: userData?.first_name,
        lastname: userData?.last_name,
        birthDate: userData?.birthdate ? dayjs(userData.birthdate) : null,
        gender: userData?.gender,
      };

      setAvatar(initial.avatar);
      setPreviewAvatar(initial.avatar);
      form.setFieldsValue(initial);
    }
  }, [userData, form]);

  const handleEditProfile = () => setIsEditing(true);

  const handleSaveProfile = async () => {
    try {
      const values = await form.validateFields();
  
      const profilePayload = {
        first_name: values.firstname,
        last_name: values.lastname,
        birthdate: values.birthDate ? values.birthDate.format("YYYY-MM-DD") : null,
        gender: values.gender,
      };
      const infoPayload = {
        name: values.name,
        email: values.email,
        phone: values.phone,
      };
  
      await instanceAxios.post("/api/v1/customer/update-profile", profilePayload);
      await instanceAxios.post("/api/v1/customer/update-info", infoPayload);
      
      message.success("Cập nhật hồ sơ thành công!");
      queryClient.invalidateQueries(["user"]);

      const updatedUser = {
        ...user,
        name: values.name,
        email: values.email,
        phone: values.phone,
      };
  
      Cookies.set("user", JSON.stringify(updatedUser), {
        expires: 7,
        secure: true,
        sameSite: "Strict",
      });
  
      setIsEditing(false);
    } catch (error) {
      if (error.response?.status === 422) {
        const apiErrors = error.response.data.errors;
        const fieldErrors = Object.entries(apiErrors).map(([field, errors]) => ({
          name: field,
          errors,
        }));
        form.setFields(fieldErrors);
        message.error(error.response.data.message || "Dữ liệu không hợp lệ!");
      } else {
        message.error("Cập nhật thất bại, vui lòng thử lại.");
      }
    }
  };
  const handleUpload = async ({ file }) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("avatar", file);
  
    try {
      const res = await instanceAxios.post("/api/v1/customer/update-info", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      const newAvatar = res?.data?.data?.avatar;
      if (newAvatar) {
        setPreviewAvatar(newAvatar);
        setAvatar(newAvatar);
  
        Cookies.set("user", JSON.stringify({ ...user, avatar: newAvatar }), {
          expires: 7,
          secure: true,
          sameSite: "Strict",
        });
  
        message.success("Ảnh đại diện cập nhật thành công!");
      } else {
        message.error("Không lấy được URL ảnh từ phản hồi API.");
      }
    } catch (err) {
      message.error("Tải ảnh thất bại, vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };
  

  const handleConfirmAvatar = () => {
    setAvatar(previewAvatar);
    setIsAvatarModalOpen(false);
  };

  return (
    <>
      {isLoading ? (
        <div className="h-screen flex justify-center items-center">
          <div className="text-center text-gray-500 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-gray-500"></div>
            <p>Đang tải thông tin...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div className="relative">
              <img alt="Profile" className="w-20 h-20 rounded-full object-cover" src={avatar} />
              <div
                className="absolute bottom-0 right-0 bg-gray-700 dark:bg-gray-500 text-white dark:text-black rounded-full p-2 cursor-pointer"
                onClick={() => setIsAvatarModalOpen(true)}
              >
                <CameraOutlined />
              </div>
            </div>
            <Button
              type={isEditing ? "primary" : "default"}
              icon={<EditOutlined />}
              onClick={isEditing ? handleSaveProfile : handleEditProfile}
            >
              {isEditing ? "Lưu" : "Chỉnh sửa hồ sơ"}
            </Button>
          </div>

          <Form form={form} layout="vertical" disabled={!isEditing}>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item label="Tên đăng nhập" name="name" rules={[{ required: true ,message: "Phải nhập tên đăng nhập!" }]}>
                <Input />
              </Form.Item>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item label="Họ" name="firstname" rules={[{ required: true ,message: "Phải nhập họ!" }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Tên" name="lastname" rules={[{ required: true ,message:"Phải nhập tên!" }]}>
                <Input />
              </Form.Item>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true,message:"Phải nhập số điện thoại!" }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Email" name="email" rules={[{ required: true,message:"Phải nhập email"},{ type: "email", message:"Không đúng định dạng email!" }]}>
                <Input />
              </Form.Item>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item label="Ngày sinh" name="birthDate" rules={[{ required: true, message:"Phải nhập ngày sinh!" }]}>
                <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label="Giới tính" name="gender" rules={[{ required: true , message:"Phải chọn giới tính!" }]}>
                <Select>
                  <Option value="male">Nam</Option>
                  <Option value="female">Nữ</Option>
                  <Option value="other">Khác</Option>
                </Select>
              </Form.Item>
            </div>
          </Form>

          <Modal
            title="Thay đổi ảnh đại diện"
            open={isAvatarModalOpen}
            onCancel={() => setIsAvatarModalOpen(false)}
            footer={[
              <Button key="cancel" onClick={() => setIsAvatarModalOpen(false)}>Hủy</Button>,
              <Button key="confirm" type="primary" onClick={handleConfirmAvatar} disabled={uploading}>Xác nhận</Button>,
            ]}
          >
            <div className="flex justify-center mb-4">
              <img alt="Preview Avatar" className="w-32 h-32 rounded-full object-cover" src={previewAvatar} />
            </div>
            <Upload showUploadList={false} customRequest={handleUpload}>
              <Button icon={<UploadOutlined />} loading={uploading}>Tải lên ảnh đại diện</Button>
            </Upload>
          </Modal>
        </>
      )}
    </>
  );
};

export default InfoProfile;