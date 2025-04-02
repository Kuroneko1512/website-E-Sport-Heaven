// src/store/reducers/auth.ts
import { createSlice } from '@reduxjs/toolkit';
import { User } from '@app/types/user';

export interface AuthState {
  currentUser: User | null;
  token: string | null;
}

const initialState: AuthState = {
  currentUser: null,
  token: localStorage.getItem('token') || null
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCurrentUser: (
      state: AuthState,
      { payload }: { payload: User | null }
    ) => {
      state.currentUser = payload;
    },
    setToken: (
      state: AuthState,
      { payload }: { payload: string | null }
    ) => {
      state.token = payload;
      if (payload) {
        localStorage.setItem('token', payload);
      } else {
        localStorage.removeItem('token');
      }
    }
  },
});

export const { setCurrentUser, setToken } = authSlice.actions;

export default authSlice.reducer;