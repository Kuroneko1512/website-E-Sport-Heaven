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
  const [isPushNotificationsEnabled, setIsPushNotificationsEnabled] = useState(true);
  const [isDesktopNotificationsEnabled, setIsDesktopNotificationsEnabled] = useState(true);
  const [isEmailNotificationsEnabled, setIsEmailNotificationsEnabled] = useState(true);

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
      {/* Appearance */}
      <SettingOption
        title="Appearance"
        description="Customize how your theme looks on your device"
      >
        <select
          className="bg-gray-100 dark:bg-gray-700 dark:text-white rounded px-4 py-2"
          value={isDarkMode ? "Dark" : "Light"} // Thiết lập giá trị của select
          onChange={handleThemeChange} // Gọi hàm khi thay đổi
        >
          <option value="Light">Light</option>
          <option value="Dark">Dark</option>
        </select>
      </SettingOption>

      {/* Language */}
      <SettingOption
        title="Language"
        description="Select your language"
      >
        <select className="bg-gray-100 dark:bg-gray-700 dark:text-white rounded px-4 py-2">
          <option>English</option>
          <option>Spanish</option>
        </select>
      </SettingOption>

      {/* Push Notifications */}
      <SettingOption
        title="Push Notifications"
        description="Receive push notification"
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

      {/* Desktop Notifications */}
      <SettingOption
        title="Desktop Notification"
        description="Receive push notification in desktop"
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

      {/* Email Notifications */}
      <SettingOption
        title="Email Notifications"
        description="Receive email notification"
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