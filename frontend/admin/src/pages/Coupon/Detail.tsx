import { useParams } from "react-router-dom";
import { FC } from "react";
const DetailCoupon: FC = () => {
    const { id } = useParams();
    return <div>DetailCoupon</div>;
};
export default DetailCoupon;
