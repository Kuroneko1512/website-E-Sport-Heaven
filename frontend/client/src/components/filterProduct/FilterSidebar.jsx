import React, { useState } from "react";
import { Slider, Checkbox } from "antd";

const FilterSidebar = ({ filters, setFilters, availableFilters }) => {
  // Format tiền tệ VND
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const [sectionsOpen, setSectionsOpen] = useState({
    categorys: true,
    price: true,
    attributes: {},
  });

  const toggleSection = (section) => {
    setSectionsOpen((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleAttributeSection = (attribute) => {
    setSectionsOpen((prev) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attribute]: !prev.attributes[attribute],
      },
    }));
  };

  const handleCategoryChange = (categoryId) => {
    setFilters((prev) => ({
      ...prev,
      categorys: prev.categorys.includes(categoryId)
        ? prev.categorys.filter((id) => id !== categoryId)
        : [categoryId] // Chỉ cho phép chọn một category
    }));
  };

  const handleAttributeChange = (attribute, value) => {
    setFilters((prev) => ({
      ...prev,
      attributefilter: {
        ...prev.attributefilter,
        [attribute]: prev?.attributefilter[attribute]?.includes(value)
          ? prev.attributefilter[attribute].filter((v) => v !== value)
          : [...(prev.attributefilter[attribute] || []), value],
      },
    }));
  };

  const handlePriceChange = (value) => {
    setFilters((prev) => ({ ...prev, priceRange: value }));
  };

  return (
    <aside className="w-full md:w-1/4 p-4 dark:bg-gray-800 dark:text-white mt-10">
      {/* Danh mục */}
      <h2
        className="text-lg font-semibold mb-2 flex justify-between items-center cursor-pointer"
        onClick={() => toggleSection("categorys")}
      >
        Danh mục
        <i
          className={`fa-solid ${
            sectionsOpen?.categorys ? "fa-angle-up" : "fa-angle-down"
          }`}
        ></i>
      </h2>
      {sectionsOpen?.categorys && (
        <div>
          {(availableFilters?.categorys || []).map((category) => (
            <Checkbox
              className="flex items-center mt-2 w-max"
              key={category.id}
              checked={filters?.categorys.includes(category.id)}
              onChange={() => handleCategoryChange(category.id)}
            >
              <span className="dark:text-white">{category.name}</span>
            </Checkbox>
          ))}
        </div>
      )}

      {/* Bộ lọc thuộc tính */}
      {(availableFilters?.attributs || []).map((attribute) => (
        <div key={attribute}>
          <h2
            className="text-lg font-semibold my-2 flex justify-between items-center cursor-pointer"
            onClick={() => toggleAttributeSection(attribute)}
          >
            {attribute}
            <i
              className={`fa-solid ${
                sectionsOpen?.attributes[attribute]
                  ? "fa-angle-up"
                  : "fa-angle-down"
              }`}
            ></i>
          </h2>
          {sectionsOpen?.attributes[attribute] && (
            <div>
              {(availableFilters?.attributefilter?.[attribute] || []).map(
                (value) => (
                  <Checkbox
                    className="flex items-center mt-2 w-max"
                    key={value}
                    checked={(
                      filters?.attributefilter?.[attribute] || []
                    ).includes(value)}
                    onChange={() => handleAttributeChange(attribute, value)}
                  >
                    <span className="dark:text-white">{value}</span>
                  </Checkbox>
                )
              )}
            </div>
          )}
        </div>
      ))}

      {/* Lọc theo giá */}
      <h2
        className="text-lg font-semibold flex justify-between items-center cursor-pointer"
        onClick={() => toggleSection("price")}
      >
        Lọc theo giá
        <i
          className={`fa-solid ${
            sectionsOpen?.price ? "fa-angle-up" : "fa-angle-down"
          }`}
        ></i>
      </h2>
      {sectionsOpen?.price && (
        <div>
          <Slider
            range
            min={availableFilters?.priceRange?.[0] || 0}
            max={availableFilters?.priceRange?.[1] || 10000000}
            step={100000}
            value={filters?.priceRange}
            onChange={handlePriceChange}
            tooltip={{
              formatter: formatCurrency
            }}
          />
          <p className="text-sm mt-2">
            {formatCurrency(filters?.priceRange[0])} - {formatCurrency(filters?.priceRange[1])}
          </p>
        </div>
      )}
    </aside>
  );
};

export default FilterSidebar;