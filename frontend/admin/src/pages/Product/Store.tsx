import { useState, useEffect, ChangeEvent } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { getCategory, Category } from "@app/services/Category/ApiCategory";
// import NoImage from "../../../public/img/default-image-icon-vector-missing-picture-page-website-design-mobile-app-no-photo-available_87543-11093.avif";
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
    console.log(product);
    setProduct((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? Number(value) : value,
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

  // Gọi API lấy danh mục
  const fetchData = async () => {
    try {
      const response = await getCategory();
      setCategories(response.data.data.data);
      console.log(response.data.data.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
    }
  };

  useEffect(() => {
    if (paramId) {
      setId(paramId); // Lưu `id` vào state khi `id` có trong URL
    }
    const fetchProduct = async () => {
    
      if (id) {
        try {
          const productData = await getProductById(Number(id));

          // Chuyển đổi selected_attributes thành mảng dạng [[2], [3]]
          const selected_attributes: number[] = [];

          productData.data.selected_attributes.forEach((attr) => {
            selected_attributes.push(attr.attribute_id);
            console.log(selected_attributes);
          });

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
     await updateProduct(Number(id), product);
    
        alert("Cập nhật sản phẩm thành công!");
      } else {
        await createProduct(product);
        alert("Tạo sản phẩm thành công!");
      }
      navigate("/product");
    } catch (error) {
      alert(isEdit ? "Lỗi khi cập nhật sản phẩm!" : "Lỗi khi tạo sản phẩm!");
    }
  };

  return (
    <div className="container-fluid bg-white p-4">
      <h3>{isEdit ? "EDIT PRODUCT" : "ADD PRODUCT"}</h3>
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
              <div className="col-3 p-3 bg-light border rounded">
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
                        <li key={index} className="my-2">
                          <Link
                            to={item}
                            className={`text-black mx-4 `}
                            style={
                              item != "Attribute" &&
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
                <Outlet context={{ product, setProduct, errors, setErrors }} />
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
            <select
              name="category_id"
              className={`form-control mt-2 ${errors.category_id ? 'is-invalid' : ''}`}
              value={product.category_id}
              onChange={handleChange}
            >
              <option value="">Chọn danh mục</option>
              {categories.map((value) => (
                <option key={value.id} value={value.id}>
                  {value.name}
                </option>
              ))}
            </select>
            {errors.category_id && <div className="invalid-feedback">{errors.category_id}</div>}
            
            <button type="submit" className="btn btn-primary my-3">
              {isEdit ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Store;
