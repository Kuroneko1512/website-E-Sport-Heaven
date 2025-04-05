import { useOutletContext } from "react-router-dom";

const Description = () => {
  const { product } = useOutletContext();

  return (
    <div>
      <p
        className="text-gray-600 mb-4 h-[15rem]"
        dangerouslySetInnerHTML={{ __html: product?.description }}
      ></p>
    </div>
  );
};

export default Description;
