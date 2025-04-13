import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import instanceAxios from "../config/db";
import { logout, updateAccessToken } from "../redux/AuthSide";

const useTokenRefresh = () => {
  const dispatch = useDispatch();
  const { accessToken, refreshToken, expiresAt, isLogin } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isLogin || !expiresAt) return; // Nếu không có thông tin token hoặc người dùng chưa đăng nhập, không làm gì

    const refreshInterval = setInterval(async () => {
      const now = new Date();
      const expiresAtDate = new Date(expiresAt); // Chuyển expires_at thành đối tượng Date

      // Tính thời gian còn lại đến khi token hết hạn
      const timeRemaining = expiresAtDate - now;

      // Nếu còn ít hơn 5 phút thì làm mới token (thời gian có thể điều chỉnh tùy theo nhu cầu)
      if (timeRemaining <= 5 * 60 * 1000) {
        try {
          // Gọi API refresh token
          const response = await instanceAxios.post("/api/v1/auth/refresh-token", { refresh_token: refreshToken });
          const { access_token, refresh_token } = response.data.data;

          // Cập nhật access_token và refresh_token trong Redux và cookies
          dispatch(updateAccessToken(access_token));
          Cookies.set("accessToken", access_token, { expires: 7, secure: true, sameSite: "Strict" });
          Cookies.set("refreshToken", refresh_token, { expires: 7, secure: true, sameSite: "Strict" });
        } catch (error) {
          console.error("Refresh token failed", error);
          dispatch(logout()); // Nếu refresh token không thành công, logout người dùng
        }
      }
    }, 60 * 1000); // Kiểm tra mỗi phút (có thể điều chỉnh theo nhu cầu)

    // Dọn dẹp khi component unmount hoặc khi người dùng logout
    return () => clearInterval(refreshInterval);
  }, [expiresAt, refreshToken, dispatch, isLogin]);
};

export default useTokenRefresh;