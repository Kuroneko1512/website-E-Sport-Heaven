import { useState, useEffect, ChangeEvent } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { getCategory, Category } from "@app/services/Category/ApiCategory";
import NoImage from "../../../public/img/default-image-icon-vector-missing-picture-page-website-design-mobile-app-no-photo-available_87543-11093.avif";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { createProduct } from "@app/services/Product/Api";
import Select, { SingleValue } from "react-select";

const Store = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [product, setProduct] = useState({
    name: "",
    price: 0,
    discount_percent: "",
    sku: "",
    product_type: "simple",
    status: "active",
    category_id: "",  
    stock: 1,
    image: null as File | null,
    description: "",
    selected_attributes: [],
    variants: [],
  });

  const ProductOptions = [
    { value: "simple", label: "simple" },
    { value: "variant", label: "variant" },
  ];
  const [selectedProduct, setSelectedProduct] = useState<{
    value: string;
    label: string;
  } | null>(ProductOptions[1]);

  const handleOptionChange = (
    newValue: SingleValue<{ value: string; label: string }>
  ) => {
    if (!newValue) return; // Kiểm tra nếu null thì không làm gì
    setSelectedProduct(newValue);
    setProduct((prev) => ({
      ...prev,
      product_type: newValue.value, // ✅ Chỉ cập nhật product_type
    }));
   

    if (newValue.value === "simple") {
      navigate("/add-product/ValueProduct");
    } else {
      navigate("/add-product/Variant");
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setProduct((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? Number(value) : value,
    }));
  console.log(product);
  };

  // Xử lý thay đổi mô tả (ReactQuill)
  const handleDescriptionChange = (content: string) => {
    setProduct((prev) => ({
      ...prev,
      description: content,
    }));
  };

  // Xử lý upload ảnh

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(URL.createObjectURL(file)); // Hiển thị ảnh xem trước

      // Cập nhật product.image với file để gửi API
      setProduct((prev) => ({
        ...prev,
        image: file, // Lưu file để gửi lên server
      }));
    }
  };

  // Gọi API lấy danh mục
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getCategory();
      setCategories(response.data.data.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      Object.entries(product).forEach(([key, value]) => {
        if (value !== null) {
          formData.append(key, value as any);
        }
      });
      if (image) {
        formData.append("image", image);
      }

      const newProduct = await createProduct(formData);
      console.log(newProduct);
      alert("Tạo sản phẩm thành công!");
    } catch (error) {
      alert("Lỗi khi tạo sản phẩm!");
    }

    setSubmitting(false);
  };

  return (
    <div className="container-fluid bg-white p-4">
      <h3>ADD PRODUCT</h3>
      <form onSubmit={handleSubmit}>
        <div className="row align-items-stretch">
          {/* Cột nhập thông tin sản phẩm */}
          <div className="col-8 bg-body-secondary p-3">
            <input
              type="text"
              className="w-100 form-control my-2"
              placeholder="Name"
              name="name"
              value={product.name}
              onChange={handleChange}
            />
            <ReactQuill
              theme="snow"
              value={product.description}
              style={{ height: "300px", marginBottom: "20px" }}
              onChange={handleDescriptionChange}
            />
            <div className="Choose mt-5">
              <Select
                options={ProductOptions}
                defaultValue={ProductOptions[0]}
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
                            {item}
                          </Link>
                        </li>
                      ))
                    : ["Variant", "Attibute"].map((item, index) => (
                        <li key={index} className="my-2">
                          <Link to={item} className="text-black mx-4">
                            {item}
                          </Link>
                        </li>
                      ))}
                </ul>
              </div>
              <div className="col-9 p-3 bg-light border">
                <Outlet context={{ product, setProduct }}  />
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
              className="form-control mt-2"
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
            <button type="submit" className="btn btn-primary my-3">
              Create
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Store;
