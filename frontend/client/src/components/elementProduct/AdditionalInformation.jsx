import React from 'react'
import { fakeData } from '../../pages/ProductDetail'

const AdditionalInformation = () => {
    const {size, color} = fakeData
    
  return (
    <div><span className='font-bold'>Size:</span> {size.map((item, index) => item + " ")} 
    <br /><span className='font-bold'>Color:</span> {color.map((item, index) => item + " ")}</div>
  )
}

export default AdditionalInformation