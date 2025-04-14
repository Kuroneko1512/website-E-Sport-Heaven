import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FaBoxOpen } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import FilterSidebar from "../components/filterProduct/FilterSidebar";
import Pagination from "../components/filterProduct/Pagination";
import ProductList from "../components/filterProduct/ProductList";
import instanceAxios from "../config/db";
import SkeletonLoading from "../components/loadingSkeleton/SkeletonLoading";

export default function Shop() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search") || "";

  // Khởi tạo state với giá trị từ URL hoặc mặc định
  const [filters, setFilters] = useState({
    categorys: searchParams.get("category")?.split(",").filter(Boolean).map(id => id.toString()) || [],
    attributefilter: JSON.parse(searchParams.get("attributes") || "{}"),
    priceRange: [
      parseInt(searchParams.get("min_price")) || 0,
      parseInt(searchParams.get("max_price")) || 10000000
    ],
  });

  // Effect để đồng bộ URL params với state khi trang load
  useEffect(() => {
    const newFilters = {
      categorys: searchParams.get("category")?.split(",").filter(Boolean).map(id => id.toString()) || [],
      attributefilter: JSON.parse(searchParams.get("attributes") || "{}"),
      priceRange: [
        parseInt(searchParams.get("min_price")) || 0,
        parseInt(searchParams.get("max_price")) || 10000000
      ],
    };
    setFilters(newFilters);
  }, [location.search]); // Chạy lại khi URL thay đổi

  const [dataToFilter, setDataToFilter] = useState({
    priceRange: [0, 10000000], // Giá trị mặc định
    categorys: [], // Sẽ lưu cả id và name của categories
    attributs: []
  });

  const [add, setAdd] = useState({});
  // const [products, setProducts] = useState([]);

  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page")) || 1);

  // Fetch all initial data in parallel
  const handleFilterChange = (newFilters) => {
    setCurrentPage(1); // Always reset to page 1 when filtering
    setFilters(newFilters);
  };

  const [
    { data: categories, isLoading: isCategoriesLoading },
    { data: attributes, isLoading: isAttributesLoading }, 
    { data: products, isLoading: isProductsLoading }
  ] = useQueries({
    queries: [
      {
        queryKey: ["categories"],
        queryFn: async () => {
          const response = await instanceAxios.get("api/v1/category/indexNoPagination");
          return response.data?.data;
        },
        staleTime: 600000
      },
      {
        queryKey: ["attributes"],
        queryFn: async () => {
          const response = await instanceAxios.get("/api/v1/attribute");
          return response.data?.data?.data;
        },
        staleTime: 600000
      },
      {
        queryKey: ["products", searchQuery, filters, currentPage],
        queryFn: async () => {
          if (searchQuery && searchQuery.trim() !== "") {
            const res = await instanceAxios.get(`api/v1/product/search?q=${searchQuery}&page=${currentPage}`);
            return res.data?.data;
          } else {
            const params = {
              category_id: filters.categorys.length > 0 ? filters.categorys.join(',') : undefined,
              min_price: filters.priceRange[0],
              max_price: filters.priceRange[1],
              page: currentPage
            };

            if (Object.keys(filters.attributefilter).length > 0) {
              params.attributes = Object.entries(filters.attributefilter)
                .flatMap(([_, values]) => values)
                .filter(Boolean)
                .join(',');
            }

            const res = await instanceAxios.get(`api/v1/product/fillter?page=${currentPage}`, { params });
            return res?.data?.data;
          }
        },
        staleTime: 600000

      }
    ]
  });

  const isInitialLoad = isCategoriesLoading || isAttributesLoading ;

  useEffect(() => {
    const fetchDynamicPriceRange = async () => {
      try {
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
      }
    };

    fetchDynamicPriceRange();
  }, [dataToFilter.priceRange]);

  const attributeMutation = useMutation({
    mutationFn: async (attributeIds) => {
      const response = await instanceAxios.post(`/api/v1/attribute/filter`, {
        attribute_ids: attributeIds,
      });
      return response.data?.data;
    },

    staleTime: 600000

  });

  const { data: attributeFilters } = attributeMutation;

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
    if (categories) {
      setDataToFilter((prev) => ({
        ...prev,
        categorys: categories.map((category) => ({
          id: category.id.toString(), // Đảm bảo id là string
          name: category.name
        }))
      }));
    }
  }, [categories]);

  // Cập nhật filters với attributes và gọi mutation
  useEffect(() => {
    (async () => {
      if (attributes) {
        setDataToFilter((prev) => ({
          ...prev,
          attributs: attributes.map((c) => c.name),
        }));
        const attributeIds = attributes.map((attr) => attr.id);
        attributeMutation.mutate(attributeIds);
      }
    })();
  }, [attributes]);

  // Cập nhật state 'add' khi attributeFilters có dữ liệu
  useEffect(() => {
    (async () => {
      if (attributeFilters) {
        const newAdd = {};
        attributeFilters.forEach((attr) => {
          newAdd[attr.name] = attr.values.map((v) => v.value);
        });
        setAdd(newAdd);
      }
    })();
  }, [attributeFilters]);

  // Cập nhật filters với giá trị 'add' vừa nhận được
  useEffect(() => {
    (async () => {
      setDataToFilter((prev) => ({
        ...prev,
        attributefilter: add,
      }));
    })();
  }, [add]);

  // Sync filters với URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    // Giữ lại search query nếu có
    if (searchQuery) {
      params.set('search', searchQuery);
    }

    // Thêm các filter vào URL
    if (filters.categorys.length) {
      params.set('category', filters.categorys.join(','));
    } else {
      params.delete('category');
    }

    if (filters.priceRange[0] !== 1 && filters.priceRange[0] !== 0) {
      params.set('min_price', filters.priceRange[0]);
    } else {
      params.delete('min_price');
    }

    if (filters.priceRange[1] !== 10000000) {
      params.set('max_price', filters.priceRange[1]);
    } else {
      params.delete('max_price');
    }

    if (Object.keys(filters.attributefilter).length > 0) {
      params.set('attributes', JSON.stringify(filters.attributefilter));
    } else {
      params.delete('attributes');
    }

    if (currentPage > 1) {
      params.set('page', currentPage);
    } else {
      params.delete('page');
    }

    // Cập nhật URL
    const newSearch = params.toString();
    if (location.search !== `?${newSearch}`) {
      navigate(`?${newSearch}`, { replace: true });
    }
  }, [filters, currentPage, searchQuery]);


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
      {isInitialLoad ? (
        <div>
          <SkeletonLoading />
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
                setFilters={handleFilterChange}
                availableFilters={dataToFilter}
              />
              <div className="flex-1">
                {isProductsLoading && !isInitialLoad ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 w-full py-10 flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-gray-500 dark:border-gray-400"></div>
                    <p>Đang tải sản phẩm...</p>
                  </div>
                ) : products?.data?.length > 0 ? (
                  <>
                    <ProductList products={products} />
                    <div className="flex justify-end mt-4">
                      <Pagination
                        totalPages={totalPages}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                      />
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
