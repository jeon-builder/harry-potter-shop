import { ADMIN_ORDER_STATUSES, displayOrderStatus } from "../config/orders.js";

function OrderStatusSelect({ status, disabled, onChange }) {
  const value = ADMIN_ORDER_STATUSES.includes(status) ? status : displayOrderStatus(status);

  return (
    <label className="order-status-field">
      <span>주문 상태</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        {ADMIN_ORDER_STATUSES.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </label>
  );
}

export default OrderStatusSelect;
