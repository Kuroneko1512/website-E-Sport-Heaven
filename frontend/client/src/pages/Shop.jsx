import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FaBoxOpen } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import FilterSidebar from "../components/filterProduct/FilterSidebar";
import Pagination from "../components/filterProduct/Pagination";
import ProductList from "../components/filterProduct/ProductList";
import instanceAxios from "../config/db";
import SkeletonLoading from "../components/loadingSkeleton/SkeletonLoading";

export default function Shop() {
  const location = useLocation(); // 🛠 Lấy query params từ URL
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search") || "";
  const [filters, setFilters] = useState({
    categorys: [],
    attributefilter: {},
    priceRange: [],
  });
  const [dataToFilter, setDataToFilter] = useState({
    priceRange: [0, 3300],
  });
  const [add, setAdd] = useState({});
  const [loading, setLoading] = useState(0);
  // const [products, setProducts] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  // const itemsPerPage = 12;
  

  const startLoading = () => setLoading((prev) => prev + 1);
  const stopLoading = () => setLoading((prev) => Math.max(0, prev - 1));

  /**
   * useEffect(() => {
  const fetchDynamicPriceRange = async () => {
    try {
      startLoading();

      const res = await instanceAxios.post("/api/v1/products/price-range", {
        filters, // hoặc searchQuery, category, attributeIds, tùy backend bạn cần
      });

      const { minPrice, maxPrice } = res.data?.data;

      if (minPrice != null && maxPrice != null) {
        setDataToFilter((prev) => ({
          ...prev,
          priceRange: [minPrice, maxPrice],
        }));
      }
    } catch (error) {
      console.error("Lỗi khi lấy giá min/max:", error);
    } finally {
      stopLoading();
    }
  };

  fetchDynamicPriceRange();
}, [filters]); 
   */

  useEffect(() => {
    const fetchDynamicPriceRange = async () => {
      try {
        startLoading();
        const [currentMin, currentMax] = filters.priceRange;
        const [newMin, newMax] = dataToFilter.priceRange;
        // Cập nhật chỉ khi giá trị khác nhau
        if (currentMin !== newMin || currentMax !== newMax) {
          setFilters((prev) => ({
            ...prev,
            priceRange: [newMin, newMax],
          }));
        }
      } catch (error) {
        console.error("Lỗi khi lấy giá min/max:", error);
      } finally {
        stopLoading();
      }
    };

    fetchDynamicPriceRange();
  }, [dataToFilter.priceRange]);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await instanceAxios.get("api/v1/category/indexNoPagination");
      return response.data?.data;
    },
  });

  // console.log("categories", categories)

  const { data: attributes } = useQuery({
    queryKey: ["attributes"],
    queryFn: async () => {
      const response = await instanceAxios.get("/api/v1/attribute");
      return response.data?.data?.data;
    },
  });

  const attributeMutation = useMutation({
    mutationFn: async (attributeIds) => {
      const response = await instanceAxios.post(`/api/v1/attribute/filter`, {
        attribute_ids: attributeIds,
      });
      return response.data?.data;
    },
  });

  const attributeFilters = attributeMutation.data;

  useEffect(() => {
    if (
      dataToFilter.priceRange &&
      filters.priceRange[0] === 0 &&
      filters.priceRange[1] === 2000 // chỉ set nếu đang là mặc định
    ) {
      setFilters((prev) => ({
        ...prev,
        priceRange: dataToFilter.priceRange,
      }));
    }
  }, [dataToFilter.priceRange]);

  // Cập nhật filters với categories
  useEffect(() => {
    (async () => {
      startLoading();
      if (categories) {
        setDataToFilter((prev) => ({
          ...prev,
          categorys: categories.map((category) => category.name),
        }));
      }
      stopLoading();
    })();
  }, [categories]);

  // Cập nhật filters với attributes và gọi mutation
  useEffect(() => {
    (async () => {
      startLoading();
      if (attributes) {
        setDataToFilter((prev) => ({
          ...prev,
          attributs: attributes.map((c) => c.name),
        }));
        const attributeIds = attributes.map((attr) => attr.id);
        attributeMutation.mutate(attributeIds);
      }
      stopLoading();
    })();
  }, [attributes]);

  // Cập nhật state 'add' khi attributeFilters có dữ liệu
  useEffect(() => {
    (async () => {
      startLoading();
      if (attributeFilters) {
        const newAdd = {};
        attributeFilters.forEach((attr) => {
          newAdd[attr.name] = attr.values.map((v) => v.value);
        });
        setAdd(newAdd);
      }
      stopLoading();
    })();
  }, [attributeFilters]);

  // Cập nhật filters với giá trị 'add' vừa nhận được
  useEffect(() => {
    (async () => {
      startLoading();
      setDataToFilter((prev) => ({
        ...prev,
        attributefilter: add,
      }));
      stopLoading();
    })();
  }, [add]);

  const isLoading2 = loading > 0;

  // console.log("dataToFilter", dataToFilter);
  // console.log("filters", filters);

  // Tạo query string từ filters
  // const queryString = useMemo(() => {
  //   const params = new URLSearchParams();
  //   if (filters.categorys.length > 0) params.append("category", filters.categorys.join(","));
  //   if (filters.colors.length > 0) params.append("color", filters.colors.join(","));
  //   if (filters.sizes.length > 0) params.append("size", filters.sizes.join(","));
  //   params.append("price_gte", filters.priceRange[0]);
  //   params.append("price_lte", filters.priceRange[1]);
  //   params.append("_page", currentPage);
  //   params.append("_limit", itemsPerPage);
  //   if (searchQuery) params.append("name_like", searchQuery); // 🛠 Tìm kiếm sản phẩm theo tên
  //   return params.toString();
  // }, [filters, currentPage, searchQuery]);

  // console.log("queryString", queryString);

  // Gọi API lấy danh sách sản phẩm dựa trên bộ lọc
  // const { data, } = useQuery({
  //   queryKey: ["products", dataToFilter, currentPage, searchQuery],
  //   queryFn: async () => {
  //     const res = await instanceAxios.get(`/api/v1/product`)
  //     return res.data;
  //   },
  //   staleTime: 60000,
  // });

  // console.log("searchQuery", searchQuery);

  // Gọi API lấy danh sách sản phẩm dựa trên bộ tìm kiếm
  const { data: products, isLoading: isProductsLoading } = useQuery({
    queryKey: ["products", searchQuery, dataToFilter, currentPage],
    queryFn: async () => {
      if (searchQuery && searchQuery.trim() !== "") {
        const res = await instanceAxios.get(`api/v1/product/search?q=${searchQuery}&page=${currentPage}`);
        return res.data?.data; // cập nhật theo cấu trúc dữ liệu trả về của bạn
      } else {
        const res = await instanceAxios.get(`api/v1/product/fillter?page=${currentPage}`);
        return res.data?.data; // cập nhật theo cấu trúc dữ liệu trả về của bạn
      }
    },
    staleTime: 600000,
    refetchInterval: 600000,
  });
  console.log("products", products);

  // console.log("productsData", productsData);
  // console.log("productsData2", productsData2);
  // console.log("data", data);
  // const products = productsData?.data?.data || [];
  // const totalPages = productsData?.total || 1;
  const totalPages = products?.last_page || 1;

  // console.log("products", products);

  return (
    <div className="bg-white text-gray-800 dark:bg-gray-800 dark:text-white m-10">
      {(isLoading2 || isProductsLoading) ? (
        <div>
            <SkeletonLoading/>
        </div>
      ) : (
        <div>
          <main className="container mx-auto py-8 grid grid-cols-1">
        <span className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Trang chủ &gt; <Link to={"/shop"}>Cửa hàng</Link>
        </span>
        <div className="flex flex-col md:flex-row">
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            availableFilters={dataToFilter}
          />
          <div className="flex-1">
            {(isProductsLoading) ? (
              <div className="text-center text-gray-500 dark:text-gray-400 w-full py-10 flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-gray-500 dark:border-gray-400"></div>
                <p>Đang tải sản phẩm...</p>
              </div>
            ) : products?.data?.length > 0 ? (
              <>
                <ProductList products={products} />
                  <div className="flex justify-end mt-4">
                    <Pagination totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} />
                  </div>
              </>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 w-full py-10 flex flex-col items-center">
                <FaBoxOpen className="text-6xl mb-2" />
                <p>Không tìm thấy sản phẩm</p>
              </div>
            )}
          </div>
        </div>
      </main>
        </div>
      )}
    </div>
  );
}