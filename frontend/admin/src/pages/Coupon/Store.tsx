import { FC, useState } from "react";
import { createCoupon, Coupon as ApiCoupon, getCouponById } from "@app/services/Coupon/ApiCoupon";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/v1/coupon';

// Hàm kiểm tra mã coupon đã tồn tại hay chưa
const checkCouponCodeExists = async (code: string): Promise<boolean> => {
    try {
        const response = await axios.get(`${API_URL}/check-code/${code}`);
        return response.data.exists;
    } catch (error) {
        console.error("Lỗi khi kiểm tra mã:", error);
        return false;
    }
};

// Type địa phương cho form
type CouponForm = {
  
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

}

// Type cho errors
type FormErrors = {
    [key in keyof Omit<CouponForm, 'id' | 'is_active'>]?: string;
}

const Store: FC = () => {
    const navigate = useNavigate();
    const [coupon, setCoupon] = useState<CouponForm>({
       
        code: "",
        name: "",
        description: "",
        discount_value: 0,
        start_date:new Date().toISOString().split('T')[0],
        end_date: "",
        discount_type: "percentage",
        min_purchase: 0,
        max_uses: 0,
        used_count: 0,
        
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {  
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const target = e.target as HTMLInputElement;
            setCoupon({ ...coupon, [name]: target.checked });
        } else {
            setCoupon({ ...coupon, [name]: value });
        }
        
        // Xóa lỗi khi người dùng chỉnh sửa trường
        if (submitted) {
            validateField(name, type === 'checkbox' ? (e.target as HTMLInputElement).checked : value);
        }
    };

    const validateField = async (name: string, value: any): Promise<boolean> => {
        let newErrors = { ...errors };
        let isValid = true;

        switch (name) {
            case 'code':
                if (!value || value.trim() === '') {
                    newErrors.code = 'Mã không được để trống';
                    isValid = false;
                } else if (value.length < 3) {
                    newErrors.code = 'Mã phải có ít nhất 3 ký tự';
                    isValid = false;

                }
                   
                break;
            case 'name':
                if (!value || value.trim() === '') {
                    newErrors.name = 'Tên không được để trống';
                    isValid = false;
                } else {
                    delete newErrors.name;
                }
                break;
            case 'discount_value':
                if (value <= 0) {
                    newErrors.discount_value = 'Giá trị giảm giá phải lớn hơn 0';
                    isValid = false;
                } else if (coupon.discount_type === 'percentage' && value > 70  ) {
                    newErrors.discount_value = 'Phần trăm giảm giá không được vượt quá 70%';
                    isValid = false;
                } else {
                    delete newErrors.discount_value;
                }
                break;
            case 'start_date':
                if (!value) {
                    newErrors.start_date = 'Ngày bắt đầu không được để trống';
                    isValid = false;
                } else if (new Date(value) < new Date(new Date().setDate(new Date().getDate() - 1))) {
                    newErrors.start_date = 'Ngày bắt đầu không thể sớm hơn hôm qua';
                    isValid = false;
                } else {
                    delete newErrors.start_date;
                }
                break;
            case 'end_date':
                if (!value) {
                    newErrors.end_date = 'Ngày kết thúc không được để trống';
                    isValid = false;
                } else if (coupon.start_date && new Date(value) < new Date(coupon.start_date)) {
                    newErrors.end_date = 'Ngày kết thúc phải sau ngày bắt đầu';
                    isValid = false;
                }
                break;
            case 'min_purchase':
                if (value <= 0) {
                    newErrors.min_purchase = 'Số tiền tối thiểu phải lớn hơn 0';
                    isValid = false;
                } else {
                    if(coupon.discount_type === 'percentage'){
                    console.log(value);
                    
                        newErrors.min_purchase = 'Số phần trăm tối thiểu phải lớn hơn 0';
                        if(value > 70){
                            newErrors.min_purchase = 'Số phần trăm tối thiểu không được vượt quá 70%';
                            isValid = false;
                        }
                    }
                    delete newErrors.min_purchase;
                }
                break;
            case 'max_uses':
                if (value <= 0) {
                    newErrors.max_uses = 'Số lần sử dụng phải lớn hơn 0';
                    isValid = false;
                } else {
                    delete newErrors.max_uses;
                }       
                break;
            default:
                break;
        }

        setErrors(newErrors);
        return isValid;
    };

    const validateForm = (): boolean => {
        let isValid = true;
        let newErrors: FormErrors = {};

        // Validate code
        if (!coupon.code || coupon.code.trim() === '') {
            newErrors.code = 'Mã không được để trống';
            isValid = false;
        } else if (coupon.code.length < 3) {
            newErrors.code = 'Mã phải có ít nhất 3 ký tự';
            isValid = false;
        }

     
        if (!coupon.name || coupon.name.trim() === '') {
            newErrors.name = 'Tên không được để trống';
            isValid = false;
        }

        // Validate discount_value
        if (coupon.discount_value <= 0) {
            newErrors.discount_value = 'Giá trị giảm giá phải lớn hơn 0';
            isValid = false;
        } else if (coupon.discount_type === 'percentage' && coupon.discount_value > 70)  {
            newErrors.discount_value = 'Phần trăm giảm giá không được vượt quá 70%';
            isValid = false;
        }

        // Validate start_date
        if (!coupon.start_date) {
            newErrors.start_date = 'Ngày bắt đầu không được để trống';
            isValid = false;
        } else if (new Date(coupon.start_date) < new Date(new Date().setDate(new Date().getDate() - 1))) {
            newErrors.start_date = 'Ngày bắt đầu không thể trong quá khứ';
            isValid = false;
        } else {
            delete newErrors.start_date;
        }

        // Validate end_date
        if (!coupon.end_date) {
            newErrors.end_date = 'Ngày kết thúc không được để trống';
            isValid = false;
        } else if (coupon.start_date && new Date(coupon.end_date) <= new Date(coupon.start_date)) {
            newErrors.end_date = 'Ngày kết thúc phải sau ngày bắt đầu';
            isValid = false;
        }
        if(coupon.start_date > coupon.end_date){
            newErrors.end_date = 'Ngày kết thúc phải sau ngày bắt đầu';
            isValid = false;
        }
        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitted(true);
        
        if (!validateForm()) {
            return;
        }
        
       
        try {

            
        
            const apiCoupon: Omit<ApiCoupon, 'id' | 'created_at' | 'updated_at' | 'used_count'> = {
                code: coupon.code,
                name: coupon.name,
                description: coupon.description,
                discount_value: coupon.discount_value,
                discount_type: coupon.discount_type as 'percentage' | 'fixed',
                min_purchase: coupon.min_purchase,
                start_date: coupon.start_date,
                end_date: coupon.end_date,
                max_uses: coupon.max_uses,
            };
            
           await createCoupon(apiCoupon);
      
            
            
            alert('Tạo mã giảm giá thành công!');
         
            setCoupon({
                id: 0,
                code: "",
                name: "",
                description: "",
                discount_value: 0,
                start_date: "",
                end_date: "",
                discount_type: "percentage",
                min_purchase: 0,
                max_uses: 0,
                used_count: 0,
            });
            setSubmitted(false);
            navigate('/coupon');
        } catch (error) {
            console.error("Lỗi khi tạo mã giảm giá:", error);
            alert('Mã giảm giá đã tồn tại!');
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="code">Mã <span className="text-danger">*</span></label>
                    <input 
                        type="text" 
                        className={`form-control ${errors.code ? 'is-invalid' : ''}`}
                        id="code" 
                        name="code" 
                        value={coupon.code} 
                        onChange={handleChange}
                         
                    />
                    {errors.code && <div className="invalid-feedback">{errors.code}</div>}
                </div>
                <div className="form-group">
                    <label htmlFor="name">Tên <span className="text-danger">*</span></label>
                    <input 
                        type="text" 
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                        id="name" 
                        name="name" 
                        value={coupon.name} 
                        onChange={handleChange}
                         
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>
                <div className="form-group">
                    <label htmlFor="description">Mô tả</label>
                    <textarea 
                        className="form-control" 
                        id="description" 
                        name="description" 
                        value={coupon.description} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="min_purchase">Số tiền tối thiểu</label>
                    <input 
                        type="number" 
                        className="form-control" 
                        id="min_purchase" 
                        name="min_purchase" 
                        value={coupon.min_purchase} 
                        onChange={handleChange}
                        min="0" 
                    />
                </div>  
                <div className="form-group">
                    <label htmlFor="start_date">Ngày bắt đầu <span className="text-danger">*</span></label>
                    <input 
                        type="date" 
                        className={`form-control ${errors.start_date ? 'is-invalid' : ''}`}
                        id="start_date" 
                        name="start_date" 
                        value={coupon.start_date} 
                        onChange={handleChange}
                         
                    />
                    {errors.start_date && <div className="invalid-feedback">{errors.start_date}</div>}
                </div>
                <div className="form-group">
                    <label htmlFor="end_date">Ngày kết thúc <span className="text-danger">*</span></label>
                    <input 
                        type="date" 
                        className={`form-control ${errors.end_date ? 'is-invalid' : ''}`}
                        id="end_date" 
                        name="end_date" 
                        value={coupon.end_date} 
                        onChange={handleChange}
                      
                    />
                    {errors.end_date && <div className="invalid-feedback">{errors.end_date}</div>}
                </div>
                <div className="form-group">
                    <label htmlFor="discount_type">Loại giảm giá <span className="text-danger">*</span></label>
                    <select 
                        className="form-control" 
                        id="discount_type" 
                        name="discount_type" 
                        value={coupon.discount_type} 
                        onChange={handleChange}
                        
                    >
                        <option value="percentage">Giảm giá theo phần trăm</option>
                        <option value="fixed">Giảm giá theo số tiền</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="discount_value">Giảm giá <span className="text-danger">*</span></label>
                    <input 
                        type="number" 
                        className={`form-control ${errors.discount_value ? 'is-invalid' : ''}`}
                        id="discount_value" 
                        name="discount_value" 
                        value={coupon.discount_value} 
                        onChange={handleChange}
                        min="0"
                        step={coupon.discount_type === 'percentage' ? '0.1' : '1000'}
                         
                    />
                    {errors.discount_value && <div className="invalid-feedback">{errors.discount_value}</div>}
                </div>
               
                <div className="form-group">
                    <label htmlFor="used_count">Số lần sử dụng</label>
                    <input 
                        type="number" 
                        className="form-control" 
                        id="used_count" 
                        name="used_count" 
                        value={coupon.used_count} 
                        onChange={handleChange}
                   
                    />
                    <small className="form-text text-muted">Trường này sẽ được cập nhật tự động khi mã giảm giá được sử dụng.</small>
                </div>
               
                <button type="submit" className="btn btn-primary">Thêm</button>
            </form>
        </div>
    );
};

export default Store;
