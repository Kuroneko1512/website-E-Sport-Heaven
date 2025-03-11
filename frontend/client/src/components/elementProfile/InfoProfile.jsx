import React, { useState } from "react"; 
import { Modal, Button, Upload, message, Form, Input, Select } from "antd";
import { EditOutlined, UploadOutlined, CameraOutlined } from "@ant-design/icons";

const { Option } = Select;

const CLOUDINARY_UPLOAD_PRESET = "avatar_upload";
const CLOUDINARY_CLOUD_NAME = "dxrhxyhl8";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

const data = {
  firstName: "Robert",
  lastName: "Fox",
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
        message.success("Profile updated successfully!");
      } else {
        message.info("No changes detected");
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
        message.success("Avatar uploaded successfully!");
      }
    } catch (error) {
      message.error("Upload failed, please try again.");
    }
    setUploading(false);
  };

  const handleConfirmAvatar = () => {
    setAvatar(previewAvatar);
    message.success("Avatar updated successfully!");
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
          <Button type="primary" onClick={handleSaveProfile} icon={<EditOutlined />}>Save</Button>
        ) : (
          <Button onClick={handleEditProfile} icon={<EditOutlined />}>Edit Profile</Button>
        )}
      </div>

      <Form form={form} layout="vertical" disabled={!isEditing} initialValues={data}>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item label={<span className="text-gray-800 dark:text-gray-200">First Name</span>} name="firstName" rules={[{ required: true, message: "Please enter your first name" }]}>
            <Input className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600"/>
          </Form.Item>
          <Form.Item label={<span className="text-gray-800 dark:text-gray-200">Last Name</span>} name="lastName" rules={[{ required: true, message: "Please enter your last name" }]}>
            <Input className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600"/>
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item label={<span className="text-gray-800 dark:text-gray-200">Phone Number</span>} name="phoneNumber" rules={[{ required: true, message: "Please enter your phone number" }]}>
            <Input className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600"/>
          </Form.Item>
          <Form.Item label={<span className="text-gray-800 dark:text-gray-200">Date of Birth</span>} name="birthDate" rules={[{ required: true, message: "Please enter your birth date" }]}>
            <Input type="date" className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600"/>
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item label={<span className="text-gray-800 dark:text-gray-200">Email</span>} name="email" rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}>
            <Input className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600"/>
          </Form.Item>
          <Form.Item label={<span className="text-gray-800 dark:text-gray-200">Gender</span>} name="gender" rules={[{ required: true, message: "Please select your gender" }]}>
            <Select className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600">
              <Option value="Male">Male</Option>
              <Option value="Female">Female</Option>
            </Select>
          </Form.Item>
        </div>
      </Form>

      {/* Modal Upload Avatar */}
      <Modal 
        title="Change Avatar" 
        open={isAvatarModalOpen} 
        onCancel={() => setIsAvatarModalOpen(false)} 
        footer={[
          <Button key="cancel" onClick={() => setIsAvatarModalOpen(false)}>Cancel</Button>,
          <Button key="confirm" type="primary" onClick={handleConfirmAvatar} disabled={uploading}>Confirm</Button>,
        ]}
      >
        <div className="flex justify-center mb-4">
          <img alt="Preview Avatar" className="w-32 h-32 rounded-full object-cover" src={previewAvatar} />
        </div>
        <Upload showUploadList={false} customRequest={handleUpload}>
          <Button icon={<UploadOutlined />} loading={uploading}>Upload New Avatar</Button>
        </Upload>
      </Modal>
    </>
  );
};

export default InfoProfile;
