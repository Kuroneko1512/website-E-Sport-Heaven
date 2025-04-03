// src/store/reducers/auth.ts
import { createSlice } from '@reduxjs/toolkit';
import { User } from '@app/types/user';

export interface AuthState {
  currentUser: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
  expiresIn: number | null;
  permissions: string[] | null;
  roles: string[] | null;
}

const initialState: AuthState = {
  currentUser: null,
  accessToken: localStorage.getItem('access_token') || null,
  refreshToken: localStorage.getItem('refresh_token') || null,
  expiresAt: localStorage.getItem('expires_at') || null,
  expiresIn: localStorage.getItem('expires_in') ? Number(localStorage.getItem('expires_in')) : null,
  permissions: localStorage.getItem('permissions') ? JSON.parse(localStorage.getItem('permissions') || '[]') : null,
  roles: localStorage.getItem('roles') ? JSON.parse(localStorage.getItem('roles') || '[]') : null
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
    setAuthData: (
      state: AuthState,
      { payload }: {
        payload: {
          accessToken: string | null,
          refreshToken: string | null,
          expiresAt: string | null,
          expiresIn: number | null,
          permissions: string[] | null,
          roles: string[] | null,
          user: User | null
        }
      }
    ) => {
      state.accessToken = payload.accessToken;
      state.refreshToken = payload.refreshToken;
      state.expiresAt = payload.expiresAt;
      state.expiresIn = payload.expiresIn;
      state.permissions = payload.permissions;
      state.roles = payload.roles;
      state.currentUser = payload.user;

      // Lưu vào localStorage
      if (payload.accessToken) {
        localStorage.setItem('access_token', payload.accessToken);
      } else {
        localStorage.removeItem('access_token');
      }

      if (payload.refreshToken) {
        localStorage.setItem('refresh_token', payload.refreshToken);
      } else {
        localStorage.removeItem('refresh_token');
      }

      if (payload.expiresAt) {
        localStorage.setItem('expires_at', payload.expiresAt);
      } else {
        localStorage.removeItem('expires_at');
      }

      if (payload.expiresIn) {
        localStorage.setItem('expires_in', payload.expiresIn.toString());
      } else {
        localStorage.removeItem('expires_in');
      }

      if (payload.permissions) {
        localStorage.setItem('permissions', JSON.stringify(payload.permissions));
      } else {
        localStorage.removeItem('permissions');
      }

      if (payload.roles) {
        localStorage.setItem('roles', JSON.stringify(payload.roles));
      } else {
        localStorage.removeItem('roles');
      }

      // Lưu thông tin user vào localStorage
      if (payload.user) {
        localStorage.setItem('user', JSON.stringify(payload.user));
      } else {
        localStorage.removeItem('user');
      }
    },
    clearAuth: (state) => {
      state.currentUser = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.expiresAt = null;
      state.expiresIn = null;
      state.permissions = null;
      state.roles = null;

      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('expires_at');
      localStorage.removeItem('expires_in');
      localStorage.removeItem('permissions');
      localStorage.removeItem('roles');
    }
  },
});

export const { setCurrentUser, setAuthData, clearAuth } = authSlice.actions;

export default authSlice.reducer;
