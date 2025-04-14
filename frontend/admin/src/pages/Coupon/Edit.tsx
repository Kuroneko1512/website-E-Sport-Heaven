import { FC, useEffect, useState, useCallback } from "react";
import { updateCoupon, getCouponById, Coupon as ApiCoupon } from "@app/services/Coupon/ApiCoupon";
import { useParams, useNavigate } from "react-router-dom";

interface Coupon {
    code: string;
    name: string;
    description: string;
    discount_value: number;
    start_date: string;
    end_date: string;
    discount_type: 'percentage' | 'fixed'; 
    min_purchase: number;
    max_uses: number;
  
}

const EditCoupon: FC = () => {
    const navigate = useNavigate();
    const id = useParams().id;
    const [coupon, setCoupon] = useState<Coupon>({
        code: "",
        name: "",
        description: "",
        discount_value: 0,
        start_date: "",
        end_date: "",
        discount_type: "percentage",
        min_purchase: 0,
        max_uses: 0,
      
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const getCoupon = useCallback(async () => {
        try {
            const response = await getCouponById(Number(id));
            console.log("API response:", response);
            
            // Đảm bảo start_date và end_date được định dạng đúng cho input type="date"
            const formattedStartDate = response.start_date 
                ? new Date(response.start_date).toISOString().split('T')[0] 
                : "";
            const formattedEndDate = response.end_date 
                ? new Date(response.end_date).toISOString().split('T')[0] 
                : "";
                
            console.log("Formatted dates:", { 
                original: { start: response.start_date, end: response.end_date },
                formatted: { start: formattedStartDate, end: formattedEndDate }
            });
            
            setCoupon({
                ...response,
                description: response.description || "",
                start_date: formattedStartDate,
                end_date: formattedEndDate,
                max_uses: response.max_uses || 0
            });
        } catch (error) {
            console.error("Error fetching coupon:", error);
        }
    }, [id]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {  
        const { name, value, type } = e.target;
        
        // Xử lý đặc biệt cho trường ngày tháng
        if (type === 'date') {
            console.log(`Date field ${name} changed to:`, value);
        }
        
        setCoupon({ ...coupon, [name]: value });
    };

    const validateForm = (): boolean => {
        let isValid = true;
        let newErrors: Record<string, string> = {};

        // Validate code
        if (!coupon.code || coupon.code.trim() === '') {
            newErrors.code = 'Mã không được để trống';
            isValid = false;
        } else if (coupon.code.length < 3) {
            newErrors.code = 'Mã phải có ít nhất 3 ký tự';
            isValid = false;
        }

        // Validate name
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
        }

        // Validate end_date
        if (!coupon.end_date) {
            newErrors.end_date = 'Ngày kết thúc không được để trống';
            isValid = false;
        } else if (coupon.start_date && new Date(coupon.end_date) <= new Date(coupon.start_date)) {
            newErrors.end_date = 'Ngày kết thúc phải sau ngày bắt đầu';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        try {
            console.log("Submitting coupon data:", coupon);
            
            // Chỉ gửi những trường cần thiết theo kiểu dữ liệu yêu cầu
            const couponData = {
                code: coupon.code,
                name: coupon.name,
                description: coupon.description,
                discount_type: coupon.discount_type,
                discount_value: Number(coupon.discount_value),
                min_purchase: Number(coupon.min_purchase),
                max_uses: Number(coupon.max_uses),
                start_date: coupon.start_date,
                end_date: coupon.end_date
            };
            
            await updateCoupon(Number(id), couponData);
            navigate("/coupon");
            alert("Cập nhật mã giảm giá thành công!");
        } catch (error) {
            console.error("Lỗi khi cập nhật mã giảm giá:", error);
            alert("Tên mã giảm giá đã tồn tại!");
        }
    };
    useEffect(() => {
        getCoupon();
    }, [getCoupon]);
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
                    <label htmlFor="discount_value">Giá trị giảm giá <span className="text-danger">*</span></label>
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
                    <label htmlFor="max_uses">Số lượt sử dụng tối đa</label>
                    <input 
                        type="number" 
                        className="form-control" 
                        id="max_uses" 
                        name="max_uses" 
                        value={coupon.max_uses} 
                        onChange={handleChange}
                        min="0" 
                    />
                  
                </div>
                
                <button type="submit" className="btn btn-primary">Cập nhật</button>
            </form>
        </div>
    );
};

export default EditCoupon;