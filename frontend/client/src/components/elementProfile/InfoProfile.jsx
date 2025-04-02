import React, { useState } from "react"; 
import { Modal, Button, Upload, message, Form, Input, Select } from "antd";
import { EditOutlined, UploadOutlined, CameraOutlined } from "@ant-design/icons";

const { Option } = Select;

const CLOUDINARY_UPLOAD_PRESET = "avatar_upload";
const CLOUDINARY_CLOUD_NAME = "dxrhxyhl8";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

const data = {
  firstName: "Robert",
  lastname: "Fox",
  phoneNumber: "0123456789",
  birthDate: "1990-01-01",
  email: "roberfox@example.com",
  gender: "Male",
  avatar:
    "https://storage.googleapis.com/a1aa/image/6EAxvabNzN3pmJEn03-aUYEvBZFYK6k_MUefs0_6En8.jpg",
};

const InfoProfile = () => {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatar, setAvatar] = useState(data.avatar);
  const [previewAvatar, setPreviewAvatar] = useState(data.avatar);
  const [uploading, setUploading] = useState(false);

  const handleEditProfile = () => setIsEditing(true);

  const handleSaveProfile = () => {
    form.validateFields().then((values) => {
      if (JSON.stringify(values) !== JSON.stringify(data)) {
        console.log("Updated Profile:", values);
        message.success("Hồ sơ đã cập nhật thành công!");
      } else {
        message.info("Không có thay đổi nào");
      }
      setIsEditing(false);
    });
  };

  const handleUpload = async ({ file }) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.secure_url) {
        setPreviewAvatar(data.secure_url);
        message.success("Ảnh đại diện tải lên thành công!");
      }
    } catch (error) {
      message.error("Tải lên thất bại, vui lòng thử lại.");
    }
    setUploading(false);
  };

  const handleConfirmAvatar = () => {
    setAvatar(previewAvatar);
    message.success("Ảnh đại diện cập nhật thành công!");
    setIsAvatarModalOpen(false);
  };

  return (
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
        {isEditing ? (
          <Button type="primary" onClick={handleSaveProfile} icon={<EditOutlined />}>Lưu</Button>
        ) : (
          <Button onClick={handleEditProfile} icon={<EditOutlined />}>Chỉnh sửa hồ sơ</Button>
        )}
      </div>

      <Form form={form} layout="vertical" disabled={!isEditing} initialValues={data}>
        <div className="grid gap-4">
          <Form.Item label={<span className="text-gray-800 dark:text-gray-200">Họ</span>} name="firstname" rules={[{ required: true, message: "Hãy nhập họ tên" }]}>
            <Input className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600"/>
          </Form.Item>
          <Form.Item label={<span className="text-gray-800 dark:text-gray-200">Tên</span>} name="lastname" rules={[{ required: true, message: "Hãy nhập họ tên" }]}>
            <Input className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600"/>
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item label={<span className="text-gray-800 dark:text-gray-200">Số điện thoại</span>} name="phoneNumber" rules={[{ required: true, message: "Hãy nhập số điện thoại" }]}>
            <Input className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600"/>
          </Form.Item>
          <Form.Item label={<span className="text-gray-800 dark:text-gray-200">Ngày sinh</span>} name="birthDate" rules={[{ required: true, message: "Hãy nhập ngày sinh" }]}>
            <Input type="date" className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600"/>
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item label={<span className="text-gray-800 dark:text-gray-200">Email</span>} name="email" rules={[{ required: true, type: "email", message: "Hãy nhập email" }]}>
            <Input className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600"/>
          </Form.Item>
          <Form.Item label={<span className="text-gray-800 dark:text-gray-200">Giới tính</span>} name="gender" rules={[{ required: true, message: "Hãy chọn giới tính" }]}>
            <Select className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600">
              <Option value="Male">Nam</Option>
              <Option value="Female">Nữ</Option>
            </Select>
          </Form.Item>
        </div>
      </Form>

      {/* Modal Upload Avatar */}
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
  );
};

export default InfoProfile;