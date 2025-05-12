import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import instanceAxios from "../../config/db";

const StarRating = ({ rating }) => {
  return (
    <div className="ml-2 text-yellow-500">
      {[...Array(5)].map((_, index) => (
        <i
          key={index}
          className={`fas fa-star ${
            index < rating ? "text-yellow-500" : "text-gray-300"
          }`}
        ></i>
      ))}
    </div>
  );
};

const Review = () => {
  const { id } = useParams();

  let { data: datareviews } = useQuery({
    queryKey: ["datareviews", id],
    queryFn: async () => {
      const res = await instanceAxios.get(`/api/v1/customer/review-by-product/${id}`);
      return res?.data;
    },
  });
  console.log("datareviews", datareviews);

  function DateTimeFormat(dateTime) {
    const formattedDate = new Date(dateTime).toLocaleString(); // This converts the datetime to a readable format
    return <>{formattedDate}</>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Đánh giá của khách hàng</h2>
      {datareviews?.data?.map((review) => (
        <div key={review.id} className="mb-6">
          <div className="flex items-start pb-4 mb-4 border-b-2">
            <img
              src={review?.images}
              alt={`Profile picture of ${review.title}`}
              className="w-12 h-12 rounded-full mr-4"
              width="50"
              height="50"
            />
            <div>
              <div className="flex flex-col items-start mb-1">
                <span className="font-semibold">{review.title}</span>
                <StarRating rating={review.rating} />
              </div>
              <p className="text-sm text-gray-600">{review.comment}</p>
              <p className="text-xs text-gray-500 mt-2">
                
                Đăng lúc
                <span className="text-gray-700 font-bold">
                  {" "}
                  {DateTimeFormat(review.created_at)}
                </span>
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Review;