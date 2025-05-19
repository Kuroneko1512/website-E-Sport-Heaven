export type CouponForm = {
    code: string;
    name: string;
    description: string;
    discount_value: number;
    min_order_amount: number;
    max_discount_amount:number;
    start_date: string;
    end_date: string;
    discount_type: number; 
   
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
    min_order_amount?: string;
    max_discount_amount?: string;
    max_uses?: string;
   
}
