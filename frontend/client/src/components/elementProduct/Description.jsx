const Description = ({ product }) => {
  return (
    <div>
      <p
        className="text-gray-600 mb-4 min-h-[15rem]"
        dangerouslySetInnerHTML={{ __html: product?.description }}
      ></p>
    </div>
  );
};

export default Description;