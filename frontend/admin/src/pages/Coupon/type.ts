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
    max_uses_per_user: number;
    is_active: number;
}


export type FormErrors = {
    [key in keyof Omit<CouponForm, 'id' | 'is_active'>]?: string;
}
