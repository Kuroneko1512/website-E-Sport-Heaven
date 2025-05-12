export type CouponForm = {
    code: string;
    name: string;
    description: string;
    discount_value: number;
    start_date: string;
    end_date: string;
    discount_type: string; 
    min_purchase: number;
    max_uses: number;
    used_count: number;
 
    is_active: number;
    user_usage: number[];
}


export interface FormErrors {
    code?: string;
    name?: string;
    description?: string;
    discount_value?: string;
    discount_type?: string;
    start_date?: string;
    end_date?: string;
    min_purchase?: string;
    max_uses?: string;
    user_usage?: string;
}
