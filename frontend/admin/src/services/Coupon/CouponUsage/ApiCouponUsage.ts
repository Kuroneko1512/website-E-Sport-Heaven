import axios from 'axios';

export interface User {
    id: number;
    name: string;
    email: string;
}

export interface Coupon {
    id: number;
    name: string;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
}

export interface CouponUsage {
    id: number;
    coupon_id: number;
    user_id: number;
    amount: number;
    created_at: string;
    updated_at: string;
    user?: User;
    coupon?: Coupon;
}

export interface PaginatedResponse {
    current_page: number;
    data: CouponUsage[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}
const API_URL = 'http://localhost:8000/api/v1/coupon-usage';
export const getCouponUsage = async (): Promise<{ data: PaginatedResponse }> => {
    try {
        const response = await axios.get(API_URL);
        return response;
    } catch (error) {
        console.error('Error fetching coupon usage:', error);
        throw error;
    }
};

export const getCouponUsageById = async (id: number): Promise<{ data: CouponUsage }> => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response;
    } catch (error) {
        console.error('Error fetching coupon usage by id:', error);
        throw error;
    }
};

export const createCouponUsage = async (data: Omit<CouponUsage, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: CouponUsage }> => {
    try {
        const response = await axios.post(API_URL, data);
        return response;
    } catch (error) {
        console.error('Error creating coupon usage:', error);
        throw error;
    }
};
export const deleteCouponUsage = async (id: number): Promise<{ data: CouponUsage }> => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response;
    } catch (error) {
        console.error('Error deleting coupon usage:', error);
        throw error;
    }
};