import { useOutletContext } from "react-router-dom";

const AdditionalInformation = () => {

  const { product } = useOutletContext();
  
  return (
    <div>
        <span className='font-bold'>Thuộc tính:</span> {product?.variants.flatMap((variant) => variant?.product_attributes).map((item)=> item?.attribute_value?.value).join(', ')}
        <br/>
        <span className='font-bold'>Sku:</span>{product?.variants.flatMap((variant) => variant?.sku).join(', ')}
    </div>
  )
}

export default AdditionalInformation