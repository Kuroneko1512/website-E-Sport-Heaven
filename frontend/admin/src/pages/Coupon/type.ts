export type CouponForm = {
    code: string;
    name: string;
    description: string;
    discount_value: number;
    start_date: string;
    end_date: string;
    discount_type: number; 
    max_purchase: number;
    max_uses: number;
    is_active: number;
  
}


export interface FormErrors {
    code?: string;
    name?: string;
    description?: string;
    discount_value?: string;
    discount_type?: string;
    start_date?: string;
    end_date?: string;
    max_purchase?: string;
    max_uses?: string;
   
}
