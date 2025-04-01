export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: "v1/admin/login",
        REGISTER: "auth/register",
        FORGOT_PASSWORD: "auth/forgot-password",
        RECOVER_PASSWORD: "auth/recover-password",
    },
    USER: {
        PROFILE: "user/profile",
        UPDATE_PROFILE: "user/update-profile",
        CHANGE_PASSWORD: "user/change-password",
        LOGOUT: "/v1/customer/logout",
        LIST: "user/list",
        CREATE: "user/create",
        UPDATE: "user/update",
        DELETE: "user/delete",
        DETAIL: (id: string) => `user/${id}`,
    },
};