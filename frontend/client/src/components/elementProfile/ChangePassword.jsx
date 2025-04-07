import React, { useState } from "react";

const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert("Mật khẩu mới và xác nhận mật khẩu không khớp!");
            return;
        }
        // Xử lý logic đổi mật khẩu tại đây
        console.log("Đổi mật khẩu thành công!");
    };

    return (
        <div className="max-w-md mx-auto p-6 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Đổi Mật Khẩu</h2>
            <form onSubmit={handleSubmit} className="flex flex-col">
                <div className="mb-4">
                    <label className="block mb-1 text-gray-700 dark:text-gray-300">Mật Khẩu Hiện Tại</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="w-full p-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-1 text-gray-700 dark:text-gray-300">Mật Khẩu Mới</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="w-full p-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-1 text-gray-700 dark:text-gray-300">Xác Nhận Mật Khẩu Mới</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full p-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                </div>
                <button
                    type="submit"
                    className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-md hover:bg-gray-700 dark:hover:bg-gray-800"
                >
                    Đổi Mật Khẩu
                </button>
            </form>
        </div>
    );
};

export default ChangePassword;
