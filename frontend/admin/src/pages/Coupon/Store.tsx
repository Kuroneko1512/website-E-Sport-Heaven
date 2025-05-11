import { FC, useEffect, useState } from "react";
import { createCoupon, Coupon as ApiCoupon } from "@app/services/Coupon/ApiCoupon";
import { useNavigate } from "react-router-dom";
import { CouponForm, FormErrors } from "./type";
import { getUserList } from "@app/services/User/Type";



const Store: FC = () => {
    const navigate = useNavigate();
    const [coupon, setCoupon] = useState<CouponForm>({
     
        code: "",
        name: "",
        description: "",
        discount_value: 0,
        discount_type: "percentage",
        start_date:new Date().toISOString().split('T')[0],
        end_date: "",
        min_purchase: 0,
        max_uses: 0,
        used_count: 0,
        is_active: 1,
        user_usage: []
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitted, setSubmitted] = useState(false);
    const [userUsage, setUserUsage] = useState<{id: number, name: string}[]>([]);

    const discountTypeOptions = [
        { value: "percentage", label: 'Phần trăm' },
        { value: "fixed", label: 'Giá tiền' }
    ];
    const fetchUserUsage = async () => {
        const response = await getUserList();
        const customerUsers = response.filter((user: any) => user.account_type === "customer");
        setUserUsage(customerUsers);
    }
    useEffect(() => {
        fetchUserUsage();
    }, []);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {  
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const target = e.target as HTMLInputElement;
            setCoupon({ ...coupon, [name]: target.checked });
        } else {
            setCoupon({ ...coupon, [name]: name === "discount_value" || name === "max_uses" || name === "discount_type"
                ? Number(value) 
                : value });
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
                } else if (coupon.discount_type === "percentage" && value > 70  ) {
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
                    if(coupon.discount_type === "percentage"){
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
        } else if (coupon.discount_type === "percentage" && coupon.discount_value > 70)  {
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
                discount_value: Number(coupon.discount_value),
                discount_type: coupon.discount_type,
                min_purchase: Number(coupon.min_purchase),
                start_date: coupon.start_date,
                end_date: coupon.end_date,
                max_uses: Number(coupon.max_uses),
                is_active: 1,
                user_usage: coupon.user_usage
            };
            console.log(apiCoupon);
            await createCoupon(apiCoupon);
      
            
            
            alert('Tạo mã giảm giá thành công!');
         
            setCoupon({
           
                code: "",
                name: "",
                description: "",
                discount_value: 0,
                discount_type: "percentage",
                start_date: "",
                end_date: "",
                min_purchase: 0,
                max_uses: 0,
                used_count: 0,
                is_active: 1,
                user_usage: []
            });
            setSubmitted(false);
            navigate('/coupon');
        } catch (error) {
            console.error("Lỗi khi tạo mã giảm giá:", error);
     
        }
    };

    const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => Number(option.value));
        console.log(selectedOptions);
        
       
        setCoupon(prev => ({
            ...prev,
            user_usage: selectedOptions
        }));
  
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
                        className="form-control"
                        id="start_date" 
                        name="start_date" 
                        value={coupon.start_date} 
                        onChange={handleChange}
                       min={new Date().toISOString().split('T')[0]}
                    />
                  
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
                        min={coupon.start_date}
                      
                    />
                    {errors.end_date && <div className="invalid-feedback">{errors.end_date}</div>}
                </div>
                <div className="form-group">
                    <label>Loại giảm giá</label>
                    <select
                        name="discount_type"
                        className="form-control"
                        value={coupon.discount_type}
                        onChange={handleChange}
                    >
                        {discountTypeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
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
                    
                </div>
                <div className="form-group">
                    <label htmlFor="user_usage" className="form-label">Chọn User được sử dụng mã giảm giá</label>
                    <select 
                        name="user_usage" 
                        id="user_usage" 
                        className={`form-control ${errors.user_usage ? 'is-invalid' : ''}`}
                        defaultValue="0"
                        onChange={handleUserChange}
                    >
                        <option value="0">Chọn User</option>
                        {userUsage.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>
                    {errors.user_usage && <div className="invalid-feedback">{errors.user_usage}</div>}
                </div>
                
               
                <button type="submit" className="btn btn-primary">Thêm</button>
            </form>
      
        </div>
    );
};

export default Store;
