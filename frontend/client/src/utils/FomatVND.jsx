import React from 'react'

const FomatVND = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(parseFloat(price).toFixed(0))
}

export default FomatVND