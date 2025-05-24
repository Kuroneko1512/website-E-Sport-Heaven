import { FC, useState } from "react";
import { createCoupon, Coupon as ApiCoupon, checkCouponCodeExists } from "@app/services/Coupon/ApiCoupon";
import { useNavigate } from "react-router-dom";
import { CouponForm, FormErrors } from "./type";
  



const Store: FC = () => {
    const navigate = useNavigate();
    
    // Định dạng cho input datetime-local
    const formatDatetimeLocal = (dateString: string) => {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
  
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const [coupon, setCoupon] = useState<CouponForm>({
     
        code: "",
        name: "",
        description: "",
        discount_value: 0,
        discount_type: 0,
        min_order_amount: 0,
        max_discount_amount: 0,
        start_date: formatDatetimeLocal(new Date().toString()),
        end_date: "",
        max_uses: 0,     
        is_active: 0,
       
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitted, setSubmitted] = useState(false);
    const vietnamTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
    console.log('Giờ Việt Nam:', vietnamTime);
  
    const vietnamTimeFormatted = formatDatetimeLocal(vietnamTime);

    const discountTypeOptions = [
        { value: 0, label: 'Phần trăm' },
        { value: 1, label: 'Giá tiền' }
    ];
   
    const validate = async (name?: string, value?: any): Promise<boolean> => {
        let newErrors = { ...errors };
        let isValid = true;

        // Nếu có name và value, chỉ validate một trường
        if (name && value !== undefined) {
            console.log(name);
            switch (name) {
                
                
                case 'code':
                    if (!value || value.trim() === '') {
                        console.log(1);
                        newErrors.code = 'Mã không được để trống';
                        isValid = false;
                    } else if (value.length < 3) {
                        newErrors.code = 'Mã phải có ít nhất 3 ký tự';
                        isValid = false;
                    } else {
                        newErrors.code = '';
                        isValid = true;
                        const exists = await checkCouponCodeExists(value);
                  
                        if (exists) {
                            newErrors.code = 'Mã này đã tồn tại trong hệ thống';
                            isValid = false;
                        } else {
                            newErrors.code = '';
                            isValid = true;
                        }
                    }
                  
                    break;
                case 'name':
                    if (!value || value.trim() === '') {
                        newErrors.name = 'Tên không được để trống';
                        isValid = false;
                    } else {
                        newErrors.name = '';
                        isValid = true;
                    }
                    break;
                case 'discount_value':
                    if (value <= 0) {
                        newErrors.discount_value = 'Giá trị giảm giá phải lớn hơn 0';
                        isValid = false;
                    } else if (coupon.discount_type === 0 && value > 50) {
                        newErrors.discount_value = 'Phần trăm giảm giá không được vượt quá 50%';
                        isValid = false;
                    } else {
                        newErrors.discount_value = '';
                        isValid = true;
                    }
                    break;
                case 'start_date':
                    if (!value) {
                        newErrors.start_date = 'Ngày bắt đầu không được để trống';
                        isValid = false;
                    } else if (new Date(value) < new Date(new Date().setMinutes(new Date().getMinutes() - 1))) {
                        newErrors.start_date = 'Ngày bắt đầu không thể trong quá khứ';
                        isValid = false;
                    } else {
                        newErrors.start_date = '';
                        isValid = true;
                    }
                    break;
                case 'end_date':
                    if (!value) {
                        newErrors.end_date = 'Ngày kết thúc không được để trống';
                        isValid = false;
                    } else if (coupon.start_date && new Date(value) <= new Date(coupon.start_date)) {
                        newErrors.end_date = 'Ngày kết thúc phải sau ngày bắt đầu';
                        isValid = false;
                    } else {
                        newErrors.end_date = '';
                        isValid = true;
                    }
                    break;
                case 'max_uses':
                    if (value <= 0) {
                        newErrors.max_uses = 'Số lần sử dụng phải lớn hơn 0';
                        isValid = false;
                    } else {
                        newErrors.max_uses = '';
                        isValid = true;
                    }
                    break;
            }
        } else {
            // Validate tất cả các trường
            if (!coupon.code || coupon.code.trim() === '') {
                newErrors.code = 'Mã không được để trống';
                isValid = false;
            } else if (coupon.code.length < 3) {
                newErrors.code = 'Mã phải có ít nhất 3 ký tự';
                isValid = false;
            } else {
                newErrors.code = '';
                isValid = true;
            }

            const exists = await checkCouponCodeExists(coupon.code);
            if (exists) {
                newErrors.code = 'Mã này đã tồn tại trong hệ thống';
                isValid = false;
            } else {
                newErrors.code = '';
                isValid = true;
            }

            if (!coupon.name || coupon.name.trim() === '') {
                newErrors.name = 'Tên không được để trống';
                isValid = false;
            } else {
                newErrors.name = '';
                isValid = true;
            }

            if (coupon.discount_value <= 0) {
                newErrors.discount_value = 'Giá trị giảm giá phải lớn hơn 0';
                isValid = false;
            } else if (coupon.discount_type === 0 && coupon.discount_value > 50) {
                newErrors.discount_value = 'Phần trăm giảm giá không được vượt quá 50%';
                isValid = false;
            } else {
                newErrors.discount_value = '';
                isValid = true;
            }

            if (!coupon.start_date) {
                newErrors.start_date = 'Ngày bắt đầu không được để trống';
                isValid = false;
            } else if (new Date(coupon.start_date) < new Date(new Date().setMinutes(new Date().getMinutes() - 1))) {
                newErrors.start_date = 'Ngày bắt đầu không thể trong quá khứ';
                isValid = false;
            } else {
                newErrors.start_date = '';
                isValid = true;
            }

            if (!coupon.end_date) {
                newErrors.end_date = 'Ngày kết thúc không được để trống';
                isValid = false;
            } else if (coupon.start_date && new Date(coupon.end_date) <= new Date(coupon.start_date)) {
                newErrors.end_date = 'Ngày kết thúc phải sau ngày bắt đầu';
                isValid = false;
            } else {
                newErrors.end_date = '';
                isValid = true;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {  
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const target = e.target as HTMLInputElement;
            setCoupon({ ...coupon, [name]: target.checked });
        } else {
            setCoupon({ ...coupon, [name]: name === "discount_value" || name === "max_uses" 
                ? Number(value) 
                : name === "discount_type"
                ? Number(value)
                : value });
        }
        
        if (submitted) {
            validate(name, type === 'checkbox' ? (e.target as HTMLInputElement).checked : value);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitted(true);
        
        if (!await validate()) {
            return;
        }
    
       
        try {

            
        
            const apiCoupon: Omit<ApiCoupon, 'id' | 'created_at' | 'updated_at' > = {
                code: coupon.code,
                name: coupon.name,
                description: coupon.description,
                discount_value: Number(coupon.discount_value),
                discount_type: Number(coupon.discount_type),
                min_order_amount: Number(coupon.min_order_amount),
                max_discount_amount: Number(coupon.max_discount_amount),
                start_date: coupon.start_date,
                end_date: coupon.end_date,
                max_uses: Number(coupon.max_uses),
                is_active: 0,
               
            };
              
                
            await createCoupon(apiCoupon);
      
            
            
            alert('Tạo mã giảm giá thành công!');
         
            setCoupon({
           
                code: "",
                name: "",
                description: "",
                discount_value: 0,
                discount_type: 0,
                min_order_amount: 0,
                max_discount_amount: 0,
                start_date: "",
                end_date: "",
                max_uses: 0,
                is_active: 0,
                
            });
            setSubmitted(false);
            navigate('/coupon');
        } catch (error) {
            console.error("Lỗi khi tạo mã giảm giá:", error);
     
        }
    };



    return (
        <div className="content">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1>Tạo mã giảm giá mới</h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item">
                                    <a href="#">Trang chủ</a>
                                </li>
                                <li className="breadcrumb-item active">Tạo mã giảm giá</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Thông tin mã giảm giá</h3>
                    <div className="card-tools">
                        <button type="button" className="btn btn-tool" data-card-widget="collapse" title="Collapse">
                            <i className="fas fa-minus"></i>
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label >Mã giảm giá <span className="text-danger">*</span></label>
                                    <input 
                                        type="text" 
                                        className={`form-control ${errors.code ? 'is-invalid' : ''}`}
                                        id="code" 
                                        name="code" 
                                        value={coupon.code} 
                                        onChange={handleChange}
                                        placeholder="Nhập mã giảm giá"
                                    />
                                    {errors.code && <div className="invalid-feedback">{errors.code}</div>}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label htmlFor="name">Tên mã giảm giá <span className="text-danger">*</span></label>
                                    <input 
                                        type="text" 
                                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                        id="name" 
                                        name="name" 
                                        value={coupon.name} 
                                        onChange={handleChange}
                                        placeholder="Nhập tên mã giảm giá"
                                    />
                                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label >Mô tả</label>
                            <textarea 
                                className="form-control" 
                                id="description" 
                                name="description" 
                                value={coupon.description} 
                                onChange={handleChange}
                                rows={3}
                                placeholder="Nhập mô tả về mã giảm giá"
                            />
                        </div>

                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label >Số tiền đơn hàng tối thiểu</label>
                                    <div className="input-group">
                                        <input 
                                            type="number" 
                                            className="form-control" 
                                            id="min_order_amount" 
                                            name="min_order_amount" 
                                            value={coupon.min_order_amount} 
                                            onChange={handleChange}
                                            min="0"
                                            placeholder="0"
                                        />
                                        <div className="input-group-append">
                                            <span className="input-group-text">VNĐ</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label >Số tiền giảm tối đa</label>
                                    <div className="input-group">
                                        <input 
                                            type="number" 
                                            className="form-control" 
                                            id="max_discount_amount" 
                                            name="max_discount_amount" 
                                            value={coupon.max_discount_amount} 
                                            onChange={handleChange}
                                            min="0"
                                            placeholder="0"
                                            disabled={coupon.discount_type === 1} // Chỉ disable khi chọn "Giá tiền"
                                        />
                                        <div className="input-group-append">
                                            <span className="input-group-text">VNĐ</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label >Ngày bắt đầu <span className="text-danger">*</span></label>
                                    <input 
                                        type="datetime-local" 
                                        className={`form-control ${errors.start_date ? 'is-invalid' : ''}`}
                                        id="start_date" 
                                        name="start_date" 
                                        value={coupon.start_date} 
                                        onChange={handleChange}
                                      
                                    />
                                    {errors.start_date && <div className="invalid-feedback">{errors.start_date}</div>}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label >Ngày kết thúc <span className="text-danger">*</span></label>
                                    <input 
                                        type="datetime-local" 
                                        className={`form-control ${errors.end_date ? 'is-invalid' : ''}`}
                                        id="end_date" 
                                        name="end_date" 
                                        value={coupon.end_date} 
                                        onChange={handleChange}
                                        min={coupon.start_date}
                                    />
                                    {errors.end_date && <div className="invalid-feedback">{errors.end_date}</div>}
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6">
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
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>Giá trị giảm giá <span className="text-danger">*</span></label>
                                    <div className="input-group">
                                        <input 
                                            type="number" 
                                            className={`form-control ${errors.discount_value ? 'is-invalid' : ''}`}
                                            id="discount_value" 
                                            name="discount_value" 
                                            value={coupon.discount_value} 
                                            onChange={handleChange}
                                            min="0"
                                            max={coupon.discount_type === 0 ? "50" : undefined}
                                            placeholder="0"
                                            required
                                        />
                                        <div className="input-group-append">
                                            <span className="input-group-text">{coupon.discount_type === 0 ? '%' : 'VNĐ'}</span>
                                        </div>
                                    </div>
                                    {errors.discount_value && <div className="invalid-feedback d-block">{errors.discount_value}</div>}
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label >Số lần sử dụng tối đa</label>
                            <input 
                                type="number" 
                                className="form-control" 
                                id="max_uses" 
                                name="max_uses" 
                                value={coupon.max_uses} 
                                onChange={handleChange}
                                min="0"
                                placeholder="0"
                            />
                        </div>

                        <div className="form-group">
                            <button type="submit" className="btn btn-primary">
                                <i className="fas fa-save mr-1"></i> Lưu mã giảm giá
                            </button>
                            <button type="button" className="btn btn-secondary ml-2" onClick={() => navigate('/coupon')}>
                                <i className="fas fa-times mr-1"></i> Hủy
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Store;
