import React, { useState } from "react";

// Component tái sử dụng cho từng mục thiết lập
const SettingOption = ({ title, description, children }) => (
  <div className="flex justify-between items-center mt-3 pb-3 border-b border-gray-200">
    <div>
      <h2 className="font-semibold">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </div>
    <div>{children}</div>
  </div>
);

const Setting = () => {
  const [theme, setTheme] = useState("Light");
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [isPushNotificationsEnabled, setIsPushNotificationsEnabled] = useState(true);
  const [isDesktopNotificationsEnabled, setIsDesktopNotificationsEnabled] = useState(true);
  const [isEmailNotificationsEnabled, setIsEmailNotificationsEnabled] = useState(true);

  return (
    <>
      {/* Appearance */}
      <SettingOption
        title="Appearance"
        description="Customize how your theme looks on your device"
      >
        <select
          className="bg-gray-100 rounded px-4 py-2"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        >
          <option>Light</option>
          <option>Dark</option>
        </select>
      </SettingOption>

      {/* Language */}
      <SettingOption
        title="Language"
        description="Select your language"
      >
        <select className="bg-gray-100 rounded px-4 py-2">
          <option>English</option>
          <option>Spanish</option>
        </select>
      </SettingOption>

      {/* Two-factor Authentication */}
      <SettingOption
        title="Two-factor Authentication"
        description="Keep your account secure by enabling 2FA via mail"
      >
        <label className="switch">
          <input
            type="checkbox"
            checked={is2FAEnabled}
            onChange={() => setIs2FAEnabled(!is2FAEnabled)}
          />
          <span className="slider round"></span>
        </label>
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
    </>
  );
};

export default Setting;