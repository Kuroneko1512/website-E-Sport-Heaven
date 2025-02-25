import { useQuery } from '@tanstack/react-query';
import React from 'react'
import { useParams } from 'react-router-dom';


const Description = () => {

  const {id} = useParams()

  const {data, isLoading, isError} = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      return await instanceAxios.get(`/products/${id}`);
    }
  })

    const {description} = data?.data
  return (
    <div>{description}</div>
  )
}
export default Description