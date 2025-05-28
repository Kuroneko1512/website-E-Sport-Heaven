import { ORDER_STATUS } from "../constants/OrderConstants";

const getActionsForOrder2 = (order) => {
  const actions = [];

  switch (order.status) {
    case ORDER_STATUS.PENDING:
      actions.push("hủy");
      break;
    case ORDER_STATUS.DELIVERED:
      actions.push("Đã nhận hàng", "yêu cầu trả hàng");
      break;
    default:
      break;
  }

  return actions;
};

export default getActionsForOrder2;