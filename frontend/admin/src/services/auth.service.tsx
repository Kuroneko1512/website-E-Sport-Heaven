import { api } from "@app/api/adminApi";
import { API_ENDPOINTS } from "@app/api/endpoints";
import { User } from "@app/types/user";

export interface LoginParams {
    identifier: string;
    password: string;
}

export interface RegisterParams {
    identifier: string;
    password: string;
    name: string;
    phone: string;
    photoURL?: string;
    permissions?: Array<string>;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    created_at: string;
    expires_at: string;
    expires_in: number;
    user: User;
    role: string[];
    permission: string[];
}

export class AuthService {
    static async login(params: LoginParams): Promise<AuthResponse> {
        console.log("Login params:", params);
        try {
            const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, params);
            console.log("Login response:", response.data);
            
            const authData = response.data.data;
            
            // Không lưu ở đây nữa, sẽ lưu thông qua Redux
            return authData;
        } catch (error: any) {
            console.error("Login error:", error.response?.data);
            throw error;
        }
    }

    static async getProfileUser(): Promise<User> {
        try {
            const response = await api.get(API_ENDPOINTS.USER.GET_PROFILE);
            console.log('getUser response:', response.data);
            return response.data.data.user;
        } catch (error) {
            console.error('getUser error:', error);
            throw error;
        }
    }

    static async logout(): Promise<void> {
        try {
            await api.post(API_ENDPOINTS.USER.LOGOUT);
        } catch (error) {
            console.error("Logout error:", error);
        }
        // Không xóa token ở đây, sẽ xóa thông qua Redux
    }

    static async resetPassword(email: string): Promise<void> {
        return api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    }

    static async recoverPassword(
        token: string,
        password: string
    ): Promise<void> {
        return api.post(API_ENDPOINTS.AUTH.RECOVER_PASSWORD, {
            token,
            password,
        });
    }
}
