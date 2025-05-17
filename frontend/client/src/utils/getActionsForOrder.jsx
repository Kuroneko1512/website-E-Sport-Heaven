import { ORDER_STATUS } from "../constants/OrderConstants";

const getActionsForOrder = (order) => {
  const actions = [];

  switch (order.status) {
    case ORDER_STATUS.PENDING:
      actions.push("hủy");
      break;
    case ORDER_STATUS.DELIVERED:
      actions.push("Đã nhận hàng", "yêu cầu trả hàng");
      break;
    case ORDER_STATUS.COMPLETED:
      actions.push("đánh giá", "mua lại");
      break;
    case ORDER_STATUS.CANCELLED:
      actions.push("mua lại");
      break;
    default:
      break;
  }

  return actions;
};

export default getActionsForOrder;