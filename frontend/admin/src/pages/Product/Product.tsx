import { Link, useNavigate } from "react-router-dom";
import { getProducts, deleteProduct, Pagination } from "@app/services/Product/Api";
import { useEffect, useState } from "react";
import FomatVND from "@app/utils/FomatVND";

interface Product {
  id?: number;
  name: string;
  description?: string;
  price: number;
  discount_percent?: string;
  product_type: "simple" | "variable";
  status: "active" | "inactive";
  category_id: string;
  stock: number;
  image?: File | null;
  selected_attributes: [];
  variants: [];
}

const Product = () => {
  const navigate = useNavigate();
  const [pagination, setPagination] = useState<Pagination>({
    current_page: 1,
    last_page: 1,
    prev_page_url: null,
    next_page_url: null,
    total: 0,
    per_page: 5,
    data: [],
  });

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getProducts(pagination.current_page, pagination.per_page);
        setProducts(response.data.data);
        setPagination((prev) => ({
          ...prev,
          ...response.data,
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [pagination.current_page]); // 🔥 Chỉ gọi khi current_page thay đổi

  return (
    // <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-100">
    //   <div className="w-full max-w-5xl overflow-x-auto bg-white shadow-lg rounded-lg p-5">
    //     <h1 className="text-3xl font-bold mb-5 text-center">Trang Sản Phẩm</h1>

    //     <Link to="/add-product" className="btn btn-success mb-4">
    //       + Add
    //     </Link>

    //     <div className="card">
    //       <div className="card-header">
    //         <h3 className="card-title">Danh sách sản phẩm</h3>
    //         <div className="card-tools">
    //           <div className="input-group input-group-sm search-box">
    //             <input type="text" className="form-control search-input" placeholder="Search" />
    //             <div className="input-group-append">
    //               <button type="submit" className="btn btn-default search-button">
    //                 <i className="fas fa-search"></i>
    //               </button>
    //             </div>
    //           </div>
    //         </div>
    //       </div>

    //       <div className="card-body table-responsive p-0">
    //         <table className="table table-hover text-nowrap">
    //           <thead>
    //             <tr>
    //               <th>ID</th>
    //               <th>Name</th>
    //               <th>Price</th>
    //               <th>Type</th>
    //               <th>Status</th>
    //               <th>Stock</th>
    //               <th>Action</th>
    //             </tr>
    //           </thead>
    //           <tbody>
    //             {products.map((product) => (
    //               <tr key={product.id}>
    //                 <td>{product.id}</td>
    //                 <td>{product.name}</td>
    //                 <td>${product.price}</td>
    //                 <td>{product.product_type}</td>
    //                 <td>
    //                   <span className={`tag ${product.status === "active" ? "tag-success" : "tag-danger"}`}>
    //                     {product.status}
    //                   </span>
    //                 </td>
    //                 <td>{product.stock}</td>
    //                 <td> <button
    //                   className="btn btn-warning btn-sm"
    //                   onClick={() => navigate(`detail/${product.id}`)}
    //                 >
    //                   Detail
    //                 </button></td>

    //               </tr>
    //             ))}
    //           </tbody>
    //         </table>
    //       </div>

    //       {/* Pagination */}
    //       <div className="card-footer clearfix">
    //         <ul className="pagination pagination-sm m-0 float-right">
    //           <li className={`page-item ${!pagination.prev_page_url && "disabled"}`}>
    //             <button
    //               className="page-link"
    //               onClick={() => setPagination((prev) => ({ ...prev, current_page: prev.current_page - 1 }))}
    //               disabled={!pagination.prev_page_url}
    //             >
    //               Pre
    //             </button>
    //           </li>

    //           {[...Array(pagination.last_page)].map((_, i) => (
    //             <li key={i} className={`page-item ${pagination.current_page === i + 1 ? "active" : ""}`}>
    //               <button className="page-link" onClick={() => setPagination((prev) => ({ ...prev, current_page: i + 1 }))}>
    //                 {i + 1}
    //               </button>
    //             </li>
    //           ))}

    //           <li className={`page-item ${!pagination.next_page_url && "disabled"}`}>
    //             <button
    //               className="page-link"
    //               onClick={() => setPagination((prev) => ({ ...prev, current_page: prev.current_page + 1 }))}
    //               disabled={!pagination.next_page_url}
    //             >
    //               Next
    //             </button>
    //           </li>
    //         </ul>
    //       </div>
    //     </div>
    //   </div>
    // </div>
    <section className="content">
    <div className="content-header">
        <div className="container-fluid">
            <div className="row mb-2">
                <div className="col-sm-6">
                    <h1>Danh sách đơn hàng</h1>
                </div>
                <div className="col-sm-6">
                    <ol className="breadcrumb float-sm-right">
                        <li className="breadcrumb-item">
                            <Link to={"/"}>Trang chủ</Link>
                        </li>
                        <li className="breadcrumb-item active">Đơn hàng</li>
                       
                    </ol>
                </div>
            </div>
        </div>
    </div>

    <div className="card">
        <div className="card-header">
            <h3 className="card-title">Đơn hàng</h3> 
            <div className="card-tools">
            <Link to="/add-product" className="btn btn-success me-2">
           + Add
       </Link>
            </div>
        </div>

        <div className="card-body p-0">
         
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
                           {products.map((product) => (
                             <tr key={product.id}>
                               <td>{product.id}</td>
                               <td>{product.name}</td>
                               <td>{FomatVND(product.price)}</td>
                               <td>{product.product_type === "variable" ? "Biến thể" : "Đơn giản"}</td>
                               <td>
                                 <span className={`tag ${product.status === "active" ? "tag-success" : "tag-danger"}`}>
                                   {product.status === "active" ? "Đang bán" : "Ngừng"}
                                 </span>
                               </td>
                               <td>{product.stock}</td>
                               <td> <button
                                 className="btn btn-warning btn-sm"
                                 onClick={() => navigate(`detail/${product.id}`)}
                               >
                                 Chi tiết
                               </button></td>
          
                             </tr>
                           ))}
                         </tbody>
                       </table>
          
        </div>
    </div>
</section>

  );
};

export default Product;
