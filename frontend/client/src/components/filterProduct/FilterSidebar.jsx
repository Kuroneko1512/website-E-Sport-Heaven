import React, { useState, useCallback } from "react";
import { Slider, Checkbox } from "antd";
import debounce from 'lodash/debounce';

const FilterSidebar = ({ filters, setFilters, availableFilters }) => {
  const [localPriceRange, setLocalPriceRange] = useState(filters.priceRange);

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

  // Debounced function để cập nhật filters
  const debouncedSetFilters = useCallback(
    debounce((newValue) => {
      setFilters(prev => ({ ...prev, priceRange: newValue }));
    }, 500),
    []
  );

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
        : [...prev.categorys, categoryId] // Cho phép chọn nhiều category
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
    setLocalPriceRange(value); // Cập nhật state local ngay lập tức
    debouncedSetFilters(value); // Debounce việc cập nhật filters chính
  };

  // Reset local price range khi filters thay đổi từ bên ngoài
  React.useEffect(() => {
    setLocalPriceRange(filters.priceRange);
  }, [filters.priceRange]);

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

      {/* Lọc theo giá */}
      <h2
        className="text-lg font-semibold flex justify-between items-center cursor-pointer my-4"
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
            value={localPriceRange}
            onChange={handlePriceChange}
            tooltip={{
              formatter: formatCurrency
            }}
          />
          <p className="text-sm mt-2">
            {formatCurrency(localPriceRange[0])} - {formatCurrency(localPriceRange[1])}
          </p>
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
    </aside>
  );
};

export default FilterSidebar;