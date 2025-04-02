import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const initialState = {
  isLogin: Cookies.get("isLogin") === "true",
  accessToken: Cookies.get("accessToken") || null,
  refreshToken: Cookies.get("refreshToken") || null,
  user: null,
};

const authSide = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      const { accessToken, refreshToken, user } = action.payload;
      state.isLogin = true;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.user = user;

      Cookies.set("isLogin", "true", { expires: 7, secure: true, sameSite: "Strict" });
      Cookies.set("accessToken", accessToken, { expires: 7, secure: true, sameSite: "Strict" });
      Cookies.set("refreshToken", refreshToken, { expires: 7, secure: true, sameSite: "Strict" });
    },
    logout: (state) => {
      state.isLogin = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;

      Cookies.remove("isLogin");
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
    },
    updateAccessToken: (state, action) => {
      state.accessToken = action.payload;
      Cookies.set("accessToken", action.payload, { expires: 7, secure: true, sameSite: "Strict" });
    },
  },
});

export const { login, logout, updateAccessToken } = authSide.actions;
export default authSide.reducer;