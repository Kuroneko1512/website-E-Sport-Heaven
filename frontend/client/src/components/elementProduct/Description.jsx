import React from 'react'
import { fakeData } from '../../pages/ProductDetail'


const Description = () => {
    const {description} = fakeData
  return (
    <div>{description}</div>
  )
}
export default Description