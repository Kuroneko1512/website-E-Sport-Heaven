export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: "v1/admin/login",
        // FORGOT_PASSWORD: "v1/admin/forgot-password",
    },
    USER: {
        UPDATE_INFO: "v1/admin/update-info",
        GET_PROFILE: "v1/admin/profile",
        UPDATE_PROFILE: "v1/admin/update-profile",
        LOGOUT: "/v1/admin/logout",
    },
    CATEGORY: {
        BASE: "v1/admin/category",
        GET_ALL: "v1/admin/category",
        GET_ALL_NO_PAGINATION: "v1/admin/category-all",
        CREATE: "v1/admin/category",
        UPDATE: "v1/admin/category",
        DELETE: "v1/admin/category",
    },
    PRODUCT: {
        BASE: "v1/admin/product",
        GET_ALL: "v1/admin/product",
        GET_BY_ID: "v1/admin/product",
        CREATE: "v1/admin/product",
        UPDATE: "v1/admin/product",
        DELETE: "v1/admin/product",
        UPDATE_STATUS: "v1/admin/product",
    },
    ORDER: {
        BASE: "v1/admin/order",
    },
    BLOG: {
        LIST: "v1/admin/blogs",
        CREATE: "v1/admin/blogs",
        UPDATE: (id: number) => `v1/admin/blogs/${id}`,
        DELETE: (id: number) => `v1/admin/blogs/${id}`,
        DETAIL: (id: number) => `v1/admin/blogs/${id}`,
        SLUG: (slug: string) => `v1/admin/blogs/slug/${slug}`,
        UPLOAD_IMAGE: "v1/admin/blogs/upload-image",
    },
    BLOG_CATEGORY: {
        LIST: "v1/admin/blog-categories",
        CREATE: "v1/admin/blog-categories",
        UPDATE: (id: number) => `v1/admin/blog-categories/${id}`,
        DELETE: (id: number) => `v1/admin/blog-categories/${id}`,
        DETAIL: (id: number) => `v1/admin/blog-categories/${id}`,
    },
    REVIEW: {
        LIST: "v1/admin/review",
        CREATE: "v1/admin/review",
        UPDATE: (id: number) => `v1/admin/review/${id}`,
        DELETE: (id: number) => `v1/admin/review/${id}`,
        DETAIL: (id: number) => `v1/admin/review/${id}`,
    },
    DASHBOARD: {
        ANALYTICS: "v1/admin/analytics/dashboard",
    }
};