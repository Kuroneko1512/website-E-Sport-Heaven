import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const initialState = {
  isLogin: Cookies.get("isLogin") === "true" ? true : false,
};

const authSide = createSlice({
  name: "auth",
  initialState, // Mặc định chưa đăng nhập
  reducers: {
    login: (state) => {
      state.isLogin = true;
      Cookies.set("isLogin", "true", { expires: 7, secure: true, sameSite: "Strict" });
    },
    logout: (state) => {
      state.isLogin = false;
      Cookies.remove("isLogin");
    },
    register: (state) => {
      state.isLogin = true;
      Cookies.set("isLogin", "true", { expires: 7, secure: true, sameSite: "Strict" });
    },
  },
});

export const { login, logout, register } = authSide.actions;
export default authSide.reducer;