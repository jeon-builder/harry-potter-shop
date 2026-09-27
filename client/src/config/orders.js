export const ORDER_STATUS_FILTERS = [
  "주문확인",
  "상품 준비중",
  "배송시작",
  "배송중",
  "배송완료",
  "주문취소",
];
export const ADMIN_ORDER_STATUSES = ORDER_STATUS_FILTERS;

const STATUS_MAP = {
  접수: "주문확인",
  전처리중: "주문확인",
  배송준비: "상품 준비중",
  완료: "배송완료",
  취소: "주문취소",
};

export function displayOrderStatus(status) {
  return STATUS_MAP[status] || status || "주문확인";
}

export function orderStatusClass(status) {
  return displayOrderStatus(status).replace(/\s+/g, "-");
}

export function matchesOrderFilter(order, filter) {
  if (!filter || filter === "전체") return true;
  return displayOrderStatus(order.status) === filter;
}

export function countOrdersByStatus(orders, status) {
  return orders.filter((order) => displayOrderStatus(order.status) === status).length;
}
