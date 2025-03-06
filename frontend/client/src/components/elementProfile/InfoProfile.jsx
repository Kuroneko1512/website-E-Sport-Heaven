import React, { useState } from "react";

// Component tái sử dụng cho mỗi trường thông tin profile
const ProfileField = ({ label, id, type, value, onChange }) => (
  <div>
    <label className="block text-gray-600" htmlFor={id}>
      {label}
    </label>
    <input
      className="w-full border border-gray-300 rounded-lg p-2"
      id={id}
      type={type}
      value={value}
      onChange={onChange}
    />
  </div>
);

const InfoProfile = () => {
  // Quản lý trạng thái của các trường
  const [firstName, setFirstName] = useState("Robert");
  const [lastName, setLastName] = useState("Fox");
  const [phoneNumber, setPhoneNumber] = useState("0123456789");
  const [address, setAddress] = useState("2464 Royal Ln. Mesa, New Jersey 45463");
  const [email, setEmail] = useState("roberfox@example.com");
  const [password, setPassword] = useState("********");

  // Hàm xử lý thay đổi ảnh profile (có thể mở dialog chọn ảnh mới)
  const handleProfileImageEdit = () => {
    alert("Chỉnh sửa ảnh profile");
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="relative">
          <img
            alt="Profile picture"
            className="w-20 h-20 rounded-full object-cover"
            height="100"
            src="https://storage.googleapis.com/a1aa/image/6EAxvabNzN3pmJEn03-aUYEvBZFYK6k_MUefs0_6En8.jpg"
            width="100"
          />
          <div
            className="absolute bottom-0 right-0 bg-black text-white rounded p-1 cursor-pointer"
            onClick={handleProfileImageEdit}
          >
            <i className="fas fa-edit"></i>
          </div>
        </div>
        <button className="bg-black text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <i className="fas fa-edit"></i>
          <span>Edit Profile</span>
        </button>
      </div>

      <form className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <ProfileField
            label="First Name"
            id="first-name"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <ProfileField
            label="Last Name"
            id="last-name"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <ProfileField
            label="Phone Number"
            id="phone-number"
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <ProfileField
            label="Address"
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <ProfileField
            label="Email Address"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <ProfileField
            label="Password"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </form>
    </>
  );
};

export default InfoProfile;