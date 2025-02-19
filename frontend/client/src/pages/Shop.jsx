import React, { useEffect, useState } from 'react'
import FilterSidebar from '../components/filterProduct/FilterSidebar';
import ProductList from '../components/filterProduct/ProductList';
import { Link } from 'react-router-dom';

const products = [
  {
    id: 1,
    name: "Allen Solly",
    category: "Women",
    price: 80,
    originalPrice: 100,
    color: "Red",
    size: "L",
    image: "https://picsum.photos/id/1/300/300",
  },
  {
    id: 2,
    name: "Louis Philippe Sport",
    category: "Men",
    price: 50,
    originalPrice: 65,
    color: "Black",
    size: "M",
    image: "https://picsum.photos/id/2/300/300",
  },
  // Add more products as needed
];

const Shop = () => {

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);

  // console.log("products", products);

    const [filteredProducts, setFilteredProducts] = useState(products);
    const [filters, setFilters] = useState({
      categorys: [], // Chuyển từ string thành array
      priceRange: [0, 2000],
      colors: [], // Chuyển từ string thành array
      sizes: [], // Chuyển từ string thành array
    });
  
    // Tự động lọc mỗi khi filters thay đổi
    useEffect(() => {
      const applyFilters = () => {
        const filtered = products.filter((product) => {
          return (
            (filters.categorys.length > 0
              ? filters.categorys.includes(product.category)
              : true) &&
            product.price >= filters.priceRange[0] &&
            product.price <= filters.priceRange[1] &&
            (filters.colors.length > 0
              ? filters.colors.includes(product.color)
              : true) &&
            (filters.sizes.length > 0
              ? filters.sizes.includes(product.size)
              : true)
          );
        });
        setFilteredProducts(filtered);
      };
  
      applyFilters();
    }, [filters]);

  return (
    <div className="bg-white text-gray-800 mx-10">
      <main className="container mx-auto py-8 grid grid-cols-1">
      <span className="text-sm text-gray-500 mb-4 ">
          Home &gt; <Link to={'/shop'}>Shop</Link>
        </span>
        <div className="flex flex-col md:flex-row">
      <FilterSidebar
        filters={filters}
        setFilters={setFilters}
        // applyFilters={applyFilters}
      />
      <ProductList products={filteredProducts} />
    </div>
      </main>
    </div>
  )
}

export default Shop