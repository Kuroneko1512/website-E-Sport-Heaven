import React, { useState } from "react";
import { Slider, Checkbox } from "antd";

const FilterSidebar = ({ filters, setFilters, categories, colors, sizes }) => {

  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);
  const [colorOpen, setColorOpen] = useState(true);
  const [sizeOpen, setSizeOpen] = useState(true);

  const toggleCategory = (setOpen) => {
    // Bằng tiếng Việt
    setOpen(prev => !prev);
  };

  /**
   * Xử lý thay đổi danh mục
   * @param {string} category tên danh mục
   */
  const handleCategoryChange = (category) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      categorys: prevFilters.categorys.includes(category)
        ? /* Nếu danh mục đã được chọn, xóa nó khỏi danh sách */
          prevFilters.categorys.filter((c) => c !== category)
        : /* Nếu danh mục chưa được chọn, thêm nó vào danh sách */
          [...prevFilters.categorys, category],
    }));
  };

  /**
   * Xử lý thay đổi màu sắc
   * @param {string} color tên màu sắc
   */
  const handleColorChange = (color) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      /**
       * colors là một mảng chứa các màu sắc đã được chọn
       * Nếu màu sắc đã được chọn, xóa nó khỏi danh sách
       * Nếu màu sắc chưa được chọn, thêm nó vào danh sách
       */
      colors: prevFilters.colors.includes(color)
        ? prevFilters.colors.filter((c) => c !== color)
        : [...prevFilters.colors, color],
    }));
  };

  /**
   * Xử lý thay đổi kích cỡ
   * @param {string} size kích cỡ
   */
  const handleSizeChange = (size) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      /**
       * sizes là một mảng chứa các kích cỡ đã được chọn
       * Nếu kích cỡ đã được chọn, xóa nó khỏi mảng
       * Nếu kích cỡ chưa được chọn, thêm nó vào mảng
       */
      sizes: prevFilters.sizes.includes(size)
        ? prevFilters.sizes.filter((s) => s !== size)
        : [...prevFilters.sizes, size],
    }));
  };

  /**
   * Xử lý thay đổi giá (Min - Max)
   * @param {number[]} value array gồm 2 giá trị (min, max)
   */
  const handlePriceChange = (value) => {
    setFilters((prevFilters) => {
      return {
        ...prevFilters,
        priceRange: value,

        // Đảm bảo giữ nguyên giá trị lọc, ngay cả khi tất cả danh mục, màu sắc, kích cỡ rỗng
        // Nếu danh mục, màu sắc, kích cỡ rỗng, set giá trị của chúng thành rỗng
        categorys: prevFilters.categorys.length > 0 ? prevFilters.categorys : [],
        colors: prevFilters.colors.length > 0 ? prevFilters.colors : [],
        sizes: prevFilters.sizes.length > 0 ? prevFilters.sizes : [],
      };
    });
  };
  

  return (
    <aside className="w-full md:w-1/4 p-4">
      {/* Lọc theo danh mục */}
      <div>
      <h2
          className="text-lg font-semibold mb-2 flex justify-between items-center cursor-pointer"
          onClick={() => toggleCategory(setCategoriesOpen)}
        >
          Product Categories
          <i className={`fa-solid ${categoriesOpen ? "fa-angle-up" : "fa-angle-down"}`}></i>
        </h2>
        {categoriesOpen && (
          <div>
        {categories.map((category) => (
          <Checkbox
          className="flex items-center mt-2 w-max"
            key={category}
            checked={filters.categorys.includes(category)}
            onChange={() => handleCategoryChange(category)}
          >
            {category}
          </Checkbox>
        ))}
        </div>
        )}
      </div>

      {/* Lọc theo màu sắc */}
      <div className="mt-4">
      <h2
          className="text-lg font-semibold my-2 flex justify-between items-center cursor-pointer"
          onClick={() => toggleCategory(setColorOpen)}
        >
          Filter by Color
          <i className={`fa-solid ${colorOpen ? "fa-angle-up" : "fa-angle-down"}`}></i>
        </h2>
        {colorOpen && (
          <div>
          {colors.map((color) => (
            <Checkbox
            className="flex items-center mt-2 w-max"
              key={color}
              checked={filters.colors.includes(color)}
              onChange={() => handleColorChange(color)}
            >
              {color}
            </Checkbox>
          ))}
          </div>
        )}
      </div>

      {/* Lọc theo kích cỡ */}
      <div className="mt-4">
      <h2
          className="text-lg font-semibold mb-2 flex justify-between items-center cursor-pointer"
          onClick={() => toggleCategory(setSizeOpen)}
        >
          Filter by Size
          <i className={`fa-solid ${sizeOpen ? "fa-angle-up" : "fa-angle-down"}`}></i>
        </h2>
        {sizeOpen && (
          <div>
          {sizes.map((size) => (
            <Checkbox
            className="flex items-center mt-2 w-max"
              key={size}
              checked={filters.sizes.includes(size)}
              onChange={() => handleSizeChange(size)}
            >
              {size}
            </Checkbox>
          ))}
          </div>
        )}
      </div>

      {/* Lọc theo giá (Min - Max) */}
      <div className="mt-4">
      <h2
          className="text-lg font-semibold flex justify-between items-center cursor-pointer"
          onClick={() => toggleCategory(setPriceOpen)}
        >
          Filter By Price
          <i className={`fa-solid ${priceOpen ? "fa-angle-up" : "fa-angle-down"}`}></i>
        </h2>
        {priceOpen && (
          <div>
          <Slider
            range
            min={0}
            max={2000}
            step={10}
            value={filters.priceRange}
            onChange={handlePriceChange}
          />
          <p className="text-sm mt-2">Min: ${filters.priceRange[0]} - Max: ${filters.priceRange[1]}</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default FilterSidebar;
