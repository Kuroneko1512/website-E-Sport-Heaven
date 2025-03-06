import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useParams } from 'react-router-dom';
import instanceAxios from '../../config/db';
import { Skeleton, Alert } from 'antd';

const Description = () => {
  const { id } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => instanceAxios.get(`/api/v1/product/${id}`),
    select: (response) => response.data.data, // Lấy trực tiếp dữ liệu cần thiết
  });
  
  return (
    <div>
      <Skeleton loading={isLoading} active>
        {data?.description || 'Không có mô tả sản phẩm'}
      </Skeleton>
    </div>
  );
};

export default Description;