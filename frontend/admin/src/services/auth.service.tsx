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

export interface LoginResponse {
    access_token: string;
    user: User;
}

export interface RegisterResponse {
    access_token: string;
    user: User;
}

export class AuthService {
    static async login(params: LoginParams): Promise<LoginResponse> {
        console.log("Login params:", params);
        try {
            const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, params);
            console.log("Login response:", response.data);
            localStorage.setItem(
                "access_token",
                response.data.data.access_token
            );
            return {
                user: response.data.data.user,
                access_token: response.data.data.access_token
            }
        } catch (error: any) {
            console.error("Login error:", error.response?.data);
            throw error;
        }
    }

    static async register(params: RegisterParams): Promise<RegisterResponse> {
        const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, params);
        localStorage.setItem("access_token", response.data.data.access_token);
        return response.data.data;
    }

    static async getUser(): Promise<{ user: User }> {
        return api.get(API_ENDPOINTS.USER.PROFILE);
    }

    static async logout(): Promise<void> {
        await api.post(API_ENDPOINTS.USER.LOGOUT);
        localStorage.removeItem("access_token");
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

    static async signInWithGoogle(): Promise<void> {
        // Implement Google login logic here
        throw new Error("Google login not implemented yet");
    }

    static async signInWithFacebook(): Promise<void> {
        // Implement Facebook login logic here
        throw new Error("Facebook login not implemented yet");
    }
}
