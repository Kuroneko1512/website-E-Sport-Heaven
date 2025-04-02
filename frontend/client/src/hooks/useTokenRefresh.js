import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import instanceAxios from "../config/db";
import { logout, updateAccessToken } from "../redux/AuthSide";

const useTokenRefresh = () => {
  const dispatch = useDispatch();
  const { refreshToken, isLogin } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isLogin || !refreshToken) return;

    const interval = setInterval(async () => {
      try {
        const res = await instanceAxios.post("/api/v1/auth/refresh-token", {
          refresh_token: refreshToken,
        });

        const newAccessToken = res.data.data.access_token;
        const newRefreshToken = res.data.data.refresh_token;

        dispatch(updateAccessToken(newAccessToken));
        Cookies.set("refreshToken", newRefreshToken, { expires: 7, secure: true, sameSite: "Strict" });
      } catch (err) {
        console.error("Refresh token failed", err);
        dispatch(logout());
      }
    }, 1000 * 60 * 10); // 10 phút

    return () => clearInterval(interval);
  }, [refreshToken, isLogin, dispatch]);
};

export default useTokenRefresh;