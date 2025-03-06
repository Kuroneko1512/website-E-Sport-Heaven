import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Alert, Skeleton } from 'antd';

const AdditionalInformation = () => {

  const { id } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => instanceAxios.get(`/api/v1/product/${id}`),
    select: (response) => response.data.data, // Lấy trực tiếp dữ liệu cần thiết
  });
  console.log("data", data);
  console.log("test:",data?.variants.flatMap((variant) => variant.product_attributes).map((item)=> item.attribute_value.value));
  console.log("sku:",data?.variants.flatMap((variant) => variant.sku));
  
  return (
    <div>
      <Skeleton loading={isLoading} active>
        <span className='font-bold'>Thuộc tính:</span> {data?.variants.flatMap((variant) => variant.product_attributes).map((item)=> item.attribute_value.value).join(', ')}
        <br/>
        <span className='font-bold'>Sku:</span>{data?.variants.flatMap((variant) => variant.sku).join(', ')}
      </Skeleton>
    </div>
  )
}

export default AdditionalInformation