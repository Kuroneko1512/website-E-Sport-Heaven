import { useState, useEffect, ChangeEvent } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { getCategory, Category , getAllCategories} from "@app/services/Category/ApiCategory";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import {
  createProduct,
  getProductById,
  updateProduct,
  api4,
} from "@app/services/Product/Api";
import Select, { SingleValue } from "react-select";

interface AttributeSelection {
  attribute_id: number;
  attribute_value_id: number;
}

interface Variant {
  price: number;
  stock: number;
  image?: File | string | null;
  product_attributes: AttributeSelection[];
}

// Định nghĩa interface cho errors
interface ValidationErrors {
  name?: string;
  price?: string;
  discount_percent?: string;
  category_id?: number;
  stock?: string;
  description?: string;
  image?: string;
}

const NoImage =
    "/img/default-image-icon-vector-missing-picture-page-website-design-mobile-app-no-photo-available_87543-11093.avif";

const Store = () => {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const [id, setId] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isEdit, setIsEdit] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [selectedTab, setSelectedTab] = useState<string>("Attribute");
  const [categoryOptions, setCategoryOptions] = useState<{ value: number; label: string }[]>([]);


  const [product, setProduct] = useState<api4>({
    name: "",
    price: 0,
    discount_percent: "",
    product_type: "simple",
    status: "active",
    category_id: 0,
    stock: 1,
    sku: "",
    image: null as File | null,
    description: "",
    selected_attributes: [],
    variants: [] as Variant[],
  });

  const ProductOptions = [
    { value: "simple", label: "Đơn giản" },
    { value: "variable", label: "Biến thể" },
  ];
  const [selectedProduct, setSelectedProduct] = useState<{
    value: string;
    label: string;
  } | null>(ProductOptions[0]);


  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {
    };

    if (!product.name.trim()) {
      newErrors.name = "Tên sản phẩm không được để trống";
    } else if (product.name.length > 255) {
      newErrors.name = "Tên sản phẩm không được vượt quá 255 ký tự";
    }

    if (!product.category_id) {
      newErrors.category_id = "Vui lòng chọn danh mục sản phẩm";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;

  };

  const handleOptionChange = (
      newValue: SingleValue<{ value: string; label: string }>
  ) => {
    if (!newValue) return;
    setSelectedProduct(newValue);
    if (newValue.value === "simple") {
      let confirm = window.confirm("Bạn có chắc muốn chuyển không");
      if (confirm) {
        product.selected_attributes = [];
        product.variants = [];
      } else {
        newValue.value = "variable";
      }

      navigate("/add-product/ValueProduct");
    } else {
      navigate("/add-product/Attribute");
    }
    setProduct((prev) => ({
      ...prev, // Giữ lại tất cả các trường cũ
      product_type: newValue.value as "simple" | "variable", // Cast to correct type
    }));
  };

  const handleChange = (
      e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setProduct((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stock"
          ? value
          : value,
    }));

    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleDescriptionChange = (content: string) => {
    setProduct((prev) => ({
      ...prev,
      description: content,
    }));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(URL.createObjectURL(file));

      setProduct((prev) => ({
        ...prev,
        image: file,
      }));

    }
  };

  // Hàm xử lý khi chọn danh mục
  const handleCategoryChange = (selectedOption: SingleValue<{ value: number; label: string }>) => {
    if (!selectedOption) return;

    setProduct((prev) => ({
      ...prev,
      category_id: selectedOption.value,
    }));

    // Xóa lỗi nếu có
    if (errors.category_id) {
      setErrors(prev => ({
        ...prev,
        category_id: undefined
      }));
    }
  };

  // Gọi API lấy danh mục
  const fetchData = async () => {
    try {
      const response = await getAllCategories();
      console.log("Categories API response:", response);

      // Lấy dữ liệu danh mục từ response
      // Dựa vào cấu trúc dữ liệu bạn cung cấp
      const categoriesData = response.data.data || [];
      setCategories(categoriesData);

      // Chuyển đổi danh mục thành options cho react-select
      const options = categoriesData.map((category: Category) => ({
        value: category.id || 0,
        label: category.name
      }));

      setCategoryOptions(options);
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
    }
  };

  useEffect(() => {
    if (paramId) {
      setId(paramId);
    }
    const fetchProduct = async () => {
      if (id) {
        try {
          const productData = await getProductById(Number(id));
          console.log(productData.data);

          // Lấy danh sách các attribute_id duy nhất từ variants
          const selected_attributes = [...new Set(
              productData.data.variants.flatMap(variant =>
                  variant.product_attributes.map(attr => attr.attribute_id)
              )
          )];

          setProduct({
            ...productData.data,
            selected_attributes: selected_attributes,
            variants: productData.data.variants || [],
          });
          setIsEdit(true);
          if (productData.data.image) {
            setImage(`http://127.0.0.1:8000/storage/${productData.data.image}`);
          }
          // Cập nhật selectedProduct dựa trên product_type
          setSelectedProduct(
              ProductOptions.find(
                  (option) => option.value === productData.data.product_type
              ) || ProductOptions[0]
          );
          if(productData.data.product_type === "variable"){
            navigate("/add-product/Attribute");
          }else{
            navigate("/add-product/ValueProduct");
          }
        } catch (error) {
          console.error("Lỗi khi lấy thông tin sản phẩm:", error);
        }
      }

    };

    fetchProduct();
    fetchData();
  }, [id]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      window.scrollTo(0, 0);
      console.log(validateForm());
      return;
    }

    try {
      if (isEdit && id) {
        // Chuyển đổi giá trị số trước khi gửi lên server
        const submitData = {
          ...product,
          price: product.price ? Number(product.price) : 0,
          stock: product.stock ? Number(product.stock) : 0,
        };
        await updateProduct(Number(id), submitData);
        alert("Cập nhật sản phẩm thành công!");
      } else {
        const submitData = {
          ...product,
          price: product.price ? Number(product.price) : 0,
          stock: product.stock ? Number(product.stock) : 0,
        };
        await createProduct(submitData);
        alert("Tạo sản phẩm thành công!");
      }
      navigate("/product");
    } catch (error) {
      alert(isEdit ? "Lỗi khi cập nhật sản phẩm!" : "Lỗi khi tạo sản phẩm!");
    }
  };

  const handleDeleteVariant = async (variantId: number) => {
    console.log(variantId);

    try {
      // Xóa variant ở database
      await updateProduct(Number(id), {
        ...product,
        delete_variant_id: [variantId]
      });

      // Cập nhật state sau khi xóa thành công
      setProduct(prev => ({
        ...prev,
        variants: prev.variants.filter(variant => variant.id !== variantId)
      }));
    } catch (error) {
      console.error("Lỗi khi xóa variant:", error);
      alert("Có lỗi xảy ra khi xóa variant!");
    }
  };

  return (
      <div className="container-fluid bg-white p-4">
        <h3>{isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}</h3>
        <form onSubmit={handleSubmit}>
          <div className="row align-items-stretch">
            {/* Cột nhập thông tin sản phẩm */}
            <div className="col-8 bg-body-secondary p-3">
              <div className="form-group">
                <input
                    type="text"
                    className={`w-100 form-control my-2 ${errors.name ? 'is-invalid' : ''}`}
                    placeholder="Name"
                    name="name"
                    value={product.name}
                    onChange={handleChange}
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>

              <div className="form-group">
                <ReactQuill
                    theme="snow"
                    value={product.description}
                    style={{ height: "300px", marginBottom: "20px" }}
                    onChange={handleDescriptionChange}
                />

              </div>

              <div className="Choose mt-5">
                <Select
                    options={ProductOptions}
                    value={selectedProduct}
                    onChange={handleOptionChange}
                />
              </div>

              {/* Chọn sản phẩm */}
              <div className="row align-items-stretch my-3">
                <div className="col-3 bg-light border p-0 ">
                  <ul>
                    {selectedProduct?.value === "simple"
                        ? ["ValueProduct"].map((item, index) => (
                            <li key={index} className="my-2">
                              <Link to={item} className="text-black mx-4">
                                {selectedProduct.label}
                              </Link>
                            </li>
                        ))
                        : ["Attribute", "Variant"].map((item, index) => (
                            <li
                                key={index}
                                className={`my-2 h-10 align-content-center ${selectedTab === item ? "bg-dark" : ""}`}
                                onClick={() => setSelectedTab(item)}
                            >
                              <Link
                                  to={item}
                                  className={`text-black mx-4`}
                                  style={
                                    item !== "Attribute" &&
                                    product.selected_attributes.length === 0
                                        ? { display: "none" }
                                        : {}
                                  }
                              >
                                {item === "Attribute" ? "Thuộc tính" : "Biến thể"}
                              </Link>
                            </li>
                        ))}
                  </ul>
                </div>
                <div className="col-9 p-3 bg-light border">
                  <Outlet context={{ product, setProduct, errors, setErrors, handleDeleteVariant }} />
                </div>
              </div>
            </div>
            <div>
              {/* Select Box */}

              {/* Chọn sản phẩm */}
            </div>

            {/* Cột upload ảnh & chọn danh mục */}
            <div className="col-4 p-3">
              <img
                  src={image || NoImage}
                  alt="Preview"
                  className="mx-4 mt-2"
                  style={{ maxHeight: "200px", borderRadius: "8px" }}
              />
              <input
                  type="file"
                  className="form-control my-3"
                  onChange={handleImageChange}
                  accept="image/*"
              />

              {/* Thay thế select box bằng react-select */}
              <div className="form-group mt-2">
                <label>Danh mục sản phẩm:</label>
                <Select
                    placeholder="Chọn danh mục"
                    options={categoryOptions}
                    value={categoryOptions.find(option => option.value === product.category_id)}
                    onChange={handleCategoryChange}
                    isClearable
                    isSearchable
                    className={errors.category_id ? 'is-invalid' : ''}
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderColor: errors.category_id ? '#dc3545' : base.borderColor,
                        '&:hover': {
                          borderColor: errors.category_id ? '#dc3545' : base.borderColor
                        }
                      }),
                      menu: (base) => ({
                        ...base,
                        maxHeight: '200px' // Giới hạn chiều cao menu dropdown
                      }),
                      menuList: (base) => ({
                        ...base,
                        maxHeight: '200px' // Giới hạn chiều cao danh sách và cho phép scroll
                      })
                    }}
                />
                {errors.category_id && <div className="invalid-feedback" style={{ display: 'block' }}>{errors.category_id}</div>}
              </div>

              {/* Thêm select box cho trạng thái sản phẩm ở đây */}
              <div className="form-group mt-3">
                <label>Trạng thái sản phẩm:</label>
                <select
                    name="status"
                    className="form-control"
                    value={product.status}
                    onChange={handleChange}
                >
                  <option value="active">Đang bán</option>
                  <option value="inactive">Ngừng bán</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary my-3">
                {isEdit ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </div>
        </form>
      </div>
  );
};

export default Store;
