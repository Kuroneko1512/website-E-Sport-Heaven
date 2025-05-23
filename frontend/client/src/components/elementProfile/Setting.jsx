import React, { useContext, useState } from "react";
import ThemeContext from "../../contexts/ThemeContext";

// Component tái sử dụng cho từng mục thiết lập
const SettingOption = ({ title, description, children }) => (
  <div className="flex justify-between items-center mt-3 pb-3 border-b border-gray-200 dark:border-gray-700">
    <div>
      <h2 className="font-semibold text-gray-900 dark:text-gray-200">{title}</h2>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
    <div>{children}</div>
  </div>
);

const Setting = () => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [isPushNotificationsEnabled, setIsPushNotificationsEnabled] = useState(false);
  const [isDesktopNotificationsEnabled, setIsDesktopNotificationsEnabled] = useState(false);
  const [isEmailNotificationsEnabled, setIsEmailNotificationsEnabled] = useState(false);

  // Hàm xử lý thay đổi theme từ select
  const handleThemeChange = (event) => {
    const selectedTheme = event.target.value;
    if (selectedTheme === 'Dark' && !isDarkMode) {
      toggleTheme();
    } else if (selectedTheme === 'Light' && isDarkMode) {
      toggleTheme();
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg shadow-md">
      {/* Chủ đề */}
      <SettingOption
        title="Chủ đề"
        description="Tùy chỉnh cách chủ đề của bạn trông trên thiết bị của bạn"
      >
        <select
          className="bg-gray-100 dark:bg-gray-700 dark:text-white rounded px-4 py-2"
          value={isDarkMode ? "Dark" : "Light"} // Thiết lập giá trị của select
          onChange={handleThemeChange} // Gọi hàm khi thay đổi
        >
          <option value="Light">Sáng</option>
          <option value="Dark">Tối</option>
        </select>
      </SettingOption>

      {/* Ngôn ngữ */}
      <SettingOption
        title="Ngôn ngữ"
        description="Chọn ngôn ngữ của bạn"
      >
        <select className="bg-gray-100 dark:bg-gray-700 dark:text-white rounded px-4 py-2">
          <option>Tiếng Việt</option>
          <option>Tiếng Anh</option>
        </select>
      </SettingOption>

      {/* Thông báo đẩy */}
      <SettingOption
        title="Thông báo đẩy"
        description="Nhận thông báo đẩy"
      >
        <label className="switch">
          <input
            type="checkbox"
            checked={isPushNotificationsEnabled}
            onChange={() => setIsPushNotificationsEnabled(!isPushNotificationsEnabled)}
          />
          <span className="slider round"></span>
        </label>
      </SettingOption>

      {/* Thông báo máy tính để bàns */}
      <SettingOption
        title="Thông báo máy tính để bàn"
        description="Nhận thông báo đẩy trong máy tính để bàn"
      >
        <label className="switch">
          <input
            type="checkbox"
            checked={isDesktopNotificationsEnabled}
            onChange={() => setIsDesktopNotificationsEnabled(!isDesktopNotificationsEnabled)}
          />
          <span className="slider round"></span>
        </label>
      </SettingOption>

      {/* Thông báo Email */}
      <SettingOption
        title="Thông báo Email"
        description="Nhận thông báo qua email"
      >
        <label className="switch">
          <input
            type="checkbox"
            checked={isEmailNotificationsEnabled}
            onChange={() => setIsEmailNotificationsEnabled(!isEmailNotificationsEnabled)}
          />
          <span className="slider round"></span>
        </label>
      </SettingOption>
    </div>
  );
};

export default Setting;