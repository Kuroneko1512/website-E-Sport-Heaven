import { FC, useEffect, useState, useCallback } from "react";
import { updateCoupon, getCouponById, checkCouponCodeExists } from "@app/services/Coupon/ApiCoupon";
import { useParams, useNavigate } from "react-router-dom";

interface Coupon {
  code: string;
  name: string;
  description: string;
  discount_value: number;
  start_date: string;
  end_date: string;
  discount_type: number;
  max_uses: number;
  min_order_amount: number;
  max_discount_amount: number;
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
    discount_type: 0,
    min_order_amount: 0,
    max_discount_amount: 0,
    max_uses: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const discountTypeOptions = [
    { value: 0, label: "Phần trăm" },
    { value: 1, label: "Giá tiền" },
  ];

  // Định dạng cho input datetime-local
  const formatDatetimeLocal = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const vietnamTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
  console.log('Giờ Việt Nam:', vietnamTime);

  const getCoupon = useCallback(async () => {
    try {
      const response = await getCouponById(Number(id));
      const formattedStartDate = response.start_date
        ? response.start_date
        : "";
      const formattedEndDate = response.end_date
        ? response.end_date
        : "";

      setCoupon({
        ...response,
        description: response.description || "",
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        max_uses: response.max_uses || 0,
        min_order_amount: response.min_order_amount || 0,
        max_discount_amount: response.max_discount_amount || 0,
        discount_type: response.discount_type || 0,
      });
    } catch (error) {
      console.error("Error fetching coupon:", error);
    }
  }, [id]);

  const validate = async (name?: string, value?: any): Promise<boolean> => {
    let isValid = true;
    let newErrors: Record<string, string> = {};

    // Nếu có name và value, chỉ validate một trường
    if (name && value !== undefined) {
      switch (name) {
        case 'code':
          if (!value || value.trim() === '') {
            newErrors.code = 'Mã không được để trống';
            isValid = false;
          } else if (value.length < 3) {
            newErrors.code = 'Mã phải có ít nhất 3 ký tự';
            isValid = false;
          } else {
            newErrors.code = '';
            isValid = true;
          }
          const exists = await checkCouponCodeExists(value);
          if (exists && value !== coupon.code) {
            newErrors.code = 'Mã này đã tồn tại trong hệ thống';
            isValid = false;
          } else {
            newErrors.code = '';
            isValid = true;
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
      if (exists && coupon.code !== (await getCouponById(Number(id))).code) {
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'datetime-local') {
      setCoupon({ ...coupon, [name]: value });
    } else {
      setCoupon({ ...coupon, [name]: value });
    }
    
    validate(name, value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!await validate()) {
      return;
    }
    try {
      const couponData = {
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: Number(coupon.discount_value),
        min_order_amount: Number(coupon.min_order_amount),
        max_discount_amount: Number(coupon.max_discount_amount),
        max_uses: Number(coupon.max_uses),
        start_date: coupon.start_date,
        end_date: coupon.end_date,
        is_active: new Date(coupon.end_date) > new Date() ? 0 : 1

      };
      
     
      await updateCoupon(Number(id), couponData);
      navigate("/coupon");
      alert("Cập nhật mã giảm giá thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật mã giảm giá:", error);
      alert("Có lỗi xảy ra khi cập nhật mã giảm giá!");
    }
  };
  useEffect(() => {
    getCoupon();
  }, [getCoupon]);
  return (
    <div className="content">
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Chỉnh sửa mã giảm giá</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <a href="#">Trang chủ</a>
                </li>
                <li className="breadcrumb-item active">Chỉnh sửa mã giảm giá</li>
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
                  <label htmlFor="code">Mã giảm giá <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className={`form-control ${errors.code ? "is-invalid" : ""}`}
                    id="code"
                    name="code"
                    value={coupon.code}
                    onChange={handleChange}
                    placeholder="Nhập mã giảm giá"
                  />
                  {errors.code && <div className="invalid-feedback d-block">{errors.code}</div>}
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label >Tên mã giảm giá <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                    id="name"
                    name="name"
                    value={coupon.name}
                    onChange={handleChange}
                    placeholder="Nhập tên mã giảm giá"
                  />
                  {errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
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
                  <label>Số tiền giảm tối đa</label>
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
                      disabled={coupon.discount_type === 0}
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
                    className={`form-control ${errors.start_date ? "is-invalid" : ""}`}
                    id="start_date"
                    name="start_date"
                    value={formatDatetimeLocal(coupon.start_date)}
                    onChange={(e) => setCoupon({ ...coupon, start_date: e.target.value })}
                  />
                  {errors.start_date && <div className="invalid-feedback d-block">{errors.start_date}</div>}
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label >Ngày kết thúc <span className="text-danger">*</span></label>
                  <input
                    type="datetime-local"
                    className={`form-control ${errors.end_date ? "is-invalid" : ""}`}
                    id="end_date"
                    name="end_date"
                    value={coupon.end_date}
                    onChange={handleChange}
                    min={coupon.start_date}
                  />
                  {errors.end_date && <div className="invalid-feedback d-block">{errors.end_date}</div>}
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label>Loại giảm giá</label>
                  <select
                    className="form-control"
                    id="discount_type"
                    name="discount_type"
                    value={coupon.discount_type}
                    onChange={handleChange}
                  >
                    {discountTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label >Giá trị giảm giá <span className="text-danger">*</span></label>
                  <div className="input-group">
                    <input
                      type="number"
                      className={`form-control ${errors.discount_value ? "is-invalid" : ""}`}
                      id="discount_value"
                      name="discount_value"
                      value={coupon.discount_value}
                      onChange={handleChange}
                      min="0"
                      max={coupon.discount_type === 0 ? "50" : undefined}
                      placeholder="0"
                    
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
                <i className="fas fa-save mr-1"></i> Cập nhật mã giảm giá
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

export default EditCoupon;
