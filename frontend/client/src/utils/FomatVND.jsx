// src/utils/FomatVND.js
import React from 'react'

const FomatVND = (price) => {
  const raw = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(parseFloat(price).toFixed(0))

  return raw.replace("₫", "VNĐ")
}

export default FomatVND