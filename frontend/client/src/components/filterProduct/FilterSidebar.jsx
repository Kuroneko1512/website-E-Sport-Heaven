import React, { useState } from "react";

const FilterSidebar = ({ filters, setFilters }) => {
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);
  const [colorOpen, setColorOpen] = useState(true);
  const [sizeOpen, setSizeOpen] = useState(true);

  const toggleCategory = (setOpen) => {
    setOpen((prev) => !prev);
  };

  const handleCheckboxChange = (key, value) => {
    /**
     * key: color
     * value: red
     */
    setFilters((prev) => {
      const currentValues = prev[key];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value) // Nếu đã có, bỏ chọn
        : [...currentValues, value]; // Nếu chưa có, thêm vào

      return { ...prev, [key]: newValues };
    });
  };

  return (
    <div
      style={{ width: "300px", padding: "20px", borderRight: "1px solid #ddd" }}
    >
      <h3 className="text-2xl font-semibold mb-2">Filters</h3>

      {/* Price Range Filter */}
      <div>
        <h2
          className="text-lg font-semibold flex justify-between items-center cursor-pointer"
          onClick={() => toggleCategory(setPriceOpen)}
        >
          Filter By Price
          <i className={`fas ${priceOpen ? "fa-minus" : "fa-plus"}`}></i>
        </h2>
        {priceOpen && (
          <div>
            <input
          type="range"
          min={0}
          max={2000}
          value={filters.priceRange[1]}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              priceRange: [0, Number(e.target.value)],
            }))
          }
        />
        <span>
          ${filters.priceRange[0]} - ${filters.priceRange[1]}
        </span>
          </div>
        ) }
      </div>

      {/* Color Filter */}
      <div>
        <h2
          className="text-lg font-semibold my-2 flex justify-between items-center cursor-pointer"
          onClick={() => toggleCategory(setColorOpen)}
        >
          Filter by Color
          <i className={`fas ${colorOpen ? "fa-minus" : "fa-plus"}`}></i>
        </h2>
        {colorOpen && (
          <div>
            {["Red", "Blue", "Black"].map((color) => (
          <label key={color} className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={filters.colors.includes(color)}
                onChange={() => handleCheckboxChange("colors", color)}
              />
              <span className="ml-2">{color}</span>
            </div>
          </label>
        ))}
          </div>
        )}
      </div>

      {/* Size Filter */}
      <div>
        <h2
          className="text-lg font-semibold mb-2 flex justify-between items-center cursor-pointer"
          onClick={() => toggleCategory(setSizeOpen)}
        >
          Filter by Size
          <i className={`fas ${sizeOpen ? "fa-minus" : "fa-plus"}`}></i>
        </h2>
        {sizeOpen && (
          <div>
            {["S", "M", "L", "XL"].map((size) => (
          <label key={size} className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={filters.sizes.includes(size)}
                onChange={() => handleCheckboxChange("sizes", size)}
              />
              <span className="ml-2">{size}</span>
            </div>
          </label>
        ))}
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div>
        <h2
          className="text-lg font-semibold mb-2 flex justify-between items-center cursor-pointer"
          onClick={() => toggleCategory(setCategoriesOpen)}
        >
          Product Categories
          <i className={`fas ${categoriesOpen ? "fa-minus" : "fa-plus"}`}></i>
        </h2>
        {categoriesOpen && (
          <div>
            {["Men", "Women", "Kids"].map((cate) => (
          <label key={cate} className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={filters.categorys.includes(cate)}
                onChange={() => handleCheckboxChange("categorys", cate)}
              />
              <span className="ml-2">{cate}</span>
            </div>
          </label>
        ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterSidebar;
