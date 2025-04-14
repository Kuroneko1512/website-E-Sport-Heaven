import React, { useState } from "react";
import { Slider, Checkbox } from "antd";

const FilterSidebar = ({ filters, setFilters, availableFilters }) => {
  // console.log("availableFilters", availableFilters);

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

  const handleCategoryChange = (category) => {
    setFilters((prev) => ({
      ...prev,
      categorys: prev?.categorys?.includes(category)
        ? prev.categorys.filter((c) => c !== category)
        : [...prev?.categorys, category],
    }));
  };

  const handleAttributeChange = (attribute, value) => {
    setFilters((prev) => ({
      ...prev,
      attributefilter: {
        ...prev.attributefilter,
        [attribute]: prev?.attributefilter[attribute]?.includes(value)
          ? prev.attributefilter[attribute].filter((v) => v !== value)
          : [...(prev.attributefilter[attribute] || []), value], // ✅ FIXED
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
              key={category}
              checked={(filters?.categorys || []).includes(category)}
              onChange={() => handleCategoryChange(category)}
            >
              <span className="dark:text-white">{category}</span>
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
            max={availableFilters?.priceRange?.[1] || 2000}
            step={10}
            value={filters?.priceRange}
            onChange={handlePriceChange}
          />
          <p className="text-sm mt-2">
            Min: ${filters?.priceRange[0]} - Max: ${filters?.priceRange[1]}
          </p>
        </div>
      )}
    </aside>
  );
};

export default FilterSidebar;