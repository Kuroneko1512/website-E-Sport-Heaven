import { useQuery } from "@tanstack/react-query";
import instanceAxios from "../config/db";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import FilterSidebar from "../components/filterProduct/FilterSidebar";
import ProductList from "../components/filterProduct/ProductList";
import { FaBoxOpen } from "react-icons/fa";
import Pagination from "../components/filterProduct/Pagination";
import axios from "axios";

export default function Shop() {
  // Fetch dữ liệu sản phẩm
  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:3000/products");
      return res.data;
    },
    staleTime: 60000, // Giữ dữ liệu trong 60 giây để tránh gọi API lại
  });

  console.log("products", products);

  // State bộ lọc
  const [filters, setFilters] = useState({
    categorys: [],
    priceRange: [0, 1500],
    colors: [],
    sizes: [],
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Lấy danh sách màu, kích cỡ, danh mục từ products
  const uniqueCategories = useMemo(() => [...new Set(products.map(p => p.category))], [products]);
  const uniqueColors = useMemo(() => [...new Set(products.flatMap(p => p.color))], [products]);
  const uniqueSizes = useMemo(() => [...new Set(products.flatMap(p => p.size))], [products]);

  // Lọc sản phẩm dựa trên filters
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      return (
        (filters.categorys.length === 0 || filters.categorys.includes(product.category)) &&
        product.price >= filters.priceRange[0] &&
        product.price <= filters.priceRange[1] &&
        (filters.colors.length === 0 || filters.colors.some(color => product.color.includes(color))) &&
        (filters.sizes.length === 0 || filters.sizes.some(size => product.size.includes(size)))
      );
    });
  }, [filters, products]);

  // Phân trang trên client
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);

  return (
    <div className="bg-white text-gray-800 m-10">
      <main className="container mx-auto py-8 grid grid-cols-1">
        <span className="text-sm text-gray-500 mb-4">
          Home &gt; <Link to={'/shop'}>Shop</Link>
        </span>
        <div className="flex flex-col md:flex-row">
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            categories={uniqueCategories}
            colors={uniqueColors}
            sizes={uniqueSizes}
          />
          <div className="flex-1">
            {isLoading ? (
              <div className="text-center text-gray-500 w-full py-10 flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-gray-500"></div>
                <p>Đang tải sản phẩm...</p>
              </div>
            ) : paginatedProducts.length > 0 ? (
              <>
                <ProductList products={paginatedProducts} />
                <div className="flex justify-end mt-4">
                  <Pagination totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} />
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 w-full py-10 flex flex-col items-center">
                <FaBoxOpen className="text-6xl mb-2" />
                <p>Không tìm thấy sản phẩm</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}