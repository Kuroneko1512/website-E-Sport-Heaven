import { Link, useNavigate } from "react-router-dom";
import {
    getProducts,
    deleteProduct,
    Pagination,
    api4,
} from "@app/services/Product/Api";
import { Pagination as AntPagination, Input, Button, Space, Select, Badge } from "antd";
import { useEffect, useState } from "react";
import FomatVND from "@app/utils/FomatVND";
import { SearchOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

// Component tùy chỉnh cho dropdown
const CustomSelect = (props: any) => {
    return (
        <Select {...props}>
            {props.children}
        </Select>
    );
};

const Product = () => {
    const navigate = useNavigate();
    const [pagination, setPagination] = useState<Pagination>({
        current_page: 1,
        last_page: 1,
        prev_page_url: null,
        next_page_url: null,
        total: 0,
        per_page: 15, // Mặc định là 15 sản phẩm/trang
        data: [],
    });

    const [products, setProducts] = useState<api4[]>([]);
    const [isDelete, setIsDelete] = useState(false);
    const [loading, setLoading] = useState(false);

    // Thêm state cho tìm kiếm
    const [searchName, setSearchName] = useState('');

    const handleDeleteProduct = async (id: number) => {
        try {
            // Xác nhận trước khi xóa
            const confirm = window.confirm(
                "Bạn có chắc chắn muốn xóa sản phẩm này không?"
            );
            if (!confirm) return;

            await deleteProduct(id);

            // Đánh dấu đã xóa để trigger useEffect
            setIsDelete(prev => !prev);

            // Hiển thị thông báo xóa thành công
            alert("Xóa sản phẩm thành công!");
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm:", error);
            alert("Xóa sản phẩm thất bại!");
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await getProducts(
                pagination.current_page,
                pagination.per_page,
                searchName
            );
            console.log("API Response:", response);

            if (response && response.status === 200) {
                // Lấy dữ liệu từ cấu trúc API thực tế
                const apiData = response.data;
                setProducts(apiData.data || []);
                setPagination({
                    current_page: apiData.current_page || 1,
                    last_page: apiData.last_page || 1,
                    prev_page_url: apiData.prev_page_url,
                    next_page_url: apiData.next_page_url,
                    total: apiData.total || 0,
                    per_page: apiData.per_page || 15,
                    data: apiData.data || [],
                });
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [pagination.current_page, pagination.per_page, isDelete]);

    const handlePageChange = (page: number, pageSize?: number) => {
        console.log("Changing page to:", page, "pageSize:", pageSize);
        setPagination(prev => ({
            ...prev,
            current_page: page,
            per_page: pageSize || prev.per_page
        }));
    };

    const handleSearch = (value: string) => {
        setSearchName(value);
        // Reset về trang 1 khi tìm kiếm
        setPagination(prev => ({
            ...prev,
            current_page: 1
        }));
        // Gọi API để tìm kiếm
        fetchData();
    };

    const handleClearSearch = () => {
        setSearchName('');
        // Reset về trang 1 khi xóa tìm kiếm
        setPagination(prev => ({
            ...prev,
            current_page: 1
        }));
        // Gọi lại API để lấy tất cả sản phẩm
        fetchData();
    };

    return (
        <section className="content">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1>Danh sách sản phẩm</h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item">
                                    <Link to={"/"}>Trang chủ</Link>
                                </li>
                                <li className="breadcrumb-item active">Sản phẩm</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Sản phẩm</h3>
                        <div className="card-tools">
                            <Link to="/add-product" className="btn btn-success me-2">
                                + Thêm
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Form tìm kiếm */}
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <Search
                                placeholder="Tìm kiếm theo tên sản phẩm"
                                allowClear
                                enterButton={<Button type="primary" icon={<SearchOutlined />}>Tìm kiếm</Button>}
                                size="large"
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                                onSearch={handleSearch}
                                onPressEnter={() => handleSearch(searchName)}
                            />
                        </div>
                        {searchName && (
                            <div className="col-md-2 d-flex align-items-center">
                                <Button onClick={handleClearSearch}>Xóa tìm kiếm</Button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center p-4">Đang tải dữ liệu...</div>
                    ) : (
                        <table className="table table-hover text-nowrap">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Tên</th>
                                    <th>Giá</th>
                                    <th>Loại</th>
                                    <th>Trạng thái</th>
                                    <th>Số lượng</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length > 0 ? (
                                    products.map((product) => (
                                        <tr key={product.id}>
                                            <td>{product.id}</td>
                                            <td>{product.name}</td>
                                            <td>
                                                {FomatVND(
                                                    product.variants.length > 0 ? product.variants[0].price || 0 : product.price || 0
                                                )}
                                            </td>
                                            <td>
                                                {product.product_type === "variable"
                                                    ? "Biến thể"
                                                    : "Đơn giản"}
                                            </td>
                                            <td>
                                                <span
                                                    className="badge"
                                                    style={{
                                                        backgroundColor: product.status === "active" ? "#52c41a" : "#f5222d",
                                                        color: "white",
                                                        padding: "5px 10px",
                                                        borderRadius: "12px",
                                                        fontSize: "12px",
                                                        fontWeight: "normal"
                                                    }}
                                                >
                                                    {product.status === "active" ? "Đang bán" : "Ngừng bán"}
                                                </span>
                                            </td>
                                            <td>{product.variants.length > 0 ? product.variants[0].stock || 0 : product.stock || 0}</td>
                                            <td>
                                                <button
                                                    className="btn btn-warning btn-sm me-2"
                                                    onClick={() => navigate(`detail/${product.id}`)}
                                                >
                                                    Chi tiết
                                                </button>
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => navigate(`/edit-product/${product.id}`)}
                                                >
                                                    Chỉnh sửa
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm mx-2"
                                                    onClick={() => product.id && handleDeleteProduct(product.id)}
                                                >
                                                    Xóa
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="text-center">
                                            Không có sản phẩm nào
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Hiển thị phân trang */}
                <div className="d-flex justify-content-center mt-4 mb-4">
                    <AntPagination
                        current={pagination.current_page}
                        pageSize={pagination.per_page}
                        total={pagination.total}
                        onChange={handlePageChange}
                        showSizeChanger
                        pageSizeOptions={['15', '25', '50']}
                        selectComponentClass={CustomSelect}
                        locale={{
                            items_per_page: '' // Xóa text "/ page"
                        }}
                        showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} Sản phẩm`}
                    />
                </div>
            </div>
        </section>
    );
};

export default Product;
