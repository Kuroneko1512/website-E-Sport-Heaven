import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

const AdditionalInformation = () => {

  const {id} = useParams()

  const {data, isLoading, isError} = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      return await instanceAxios.get(`/products/${id}`);
    }
  })


    const {size, color} = data?.data
    
  return (
    <div><span className='font-bold'>Size:</span> {size.map((item, index) => item + " ")} 
    <br /><span className='font-bold'>Color:</span> {color.map((item, index) => item + " ")}</div>
  )
}

export default AdditionalInformation