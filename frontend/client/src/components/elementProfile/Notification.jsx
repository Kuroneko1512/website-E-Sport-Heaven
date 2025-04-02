import React from "react";

const fakeData = [
  {
    icon: "https://storage.googleapis.com/a1aa/image/acTpB5Oe5ejog0MEExKyU7QztHCk7RUBCTBLMvsrxpA.jpg",

    title: "Cập nhật hồ sơ",
    description: "Bạn vừa cập nhật ảnh hồ sơ của bạn",

    time: "2025-03-06T14:23:17.000000Z",
  },
  {
    icon: "fas fa-box",

    title: "Đơn hàng của bạn được đặt thành công",
    description: "Bạn đã đặt một đơn đặt hàng mới",

    time: "2025-03-06 11:16:00",
  },
  {
    icon: "fas fa-truck",
    title: "Đơn đặt hàng được giao",
    description: "Đơn đặt hàng của bạn đã được giao thành công",
    time: "2025-03-05 09:00:00",
  },
  {
    icon: "https://storage.googleapis.com/a1aa/image/eOzAmiMsrxv9dECBey7QehkyqEbEnyc0UdCb4d8Si2M.jpg",

    title: "Bạn đã chia sẻ phản hồi của bạn",
    description: "“Đó là một trải nghiệm tuyệt vời với công ty của bạn”",

    time: "2025-03-04 20:30:00",
  },
  {
    icon: "fas fa-lock",

    title: "Mật khẩu được cập nhật thành công",
    description: "Mật khẩu của bạn đã được cập nhật thành công",

    time: "2025-03-04T08:00:00.000000Z",
  },
];

const formatTime = (timeString) => {
  const date = new Date(timeString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just Now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 172800) return "Yesterday";

  return date.toLocaleDateString("en-GB");
};

const Notification = () => {
  return (
    <>
      <div className="space-y-6">
        {fakeData.map((notification, index) => (
          <div
            key={index}
            className="flex justify-between items-center border-b border-gray-200 pb-3 dark:border-gray-700"
          >
            <div className="flex items-center space-x-4">
              {notification.icon.startsWith("http") ? (
                <img
                  alt={notification.title}
                  className="h-10 w-10 rounded-full"
                  src={notification.icon}
                />
              ) : (
                <i
                  className={`${notification.icon} text-2xl text-gray-600 dark:text-gray-400`}
                ></i>
              )}
              <div>
                <p className="font-semibold dark:text-white">
                  {notification.title}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {notification.description}
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {formatTime(notification.time)}
            </p>
          </div>
        ))}
      </div>
    </>
  );
};

export default Notification;