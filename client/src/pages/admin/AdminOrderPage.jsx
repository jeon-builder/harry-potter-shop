import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { fetchOrders, updateOrder } from "../../api/client.js";
import { useAuth } from "../../auth/AuthContext.jsx";
import OrderStatusSelect from "../../components/OrderStatusSelect.jsx";
import ShopFooter from "../../components/ShopFooter.jsx";
import ShopHeader from "../../components/ShopHeader.jsx";
import { formatOrderPayment } from "../../config/currency.js";
import {
  ORDER_STATUS_FILTERS,
  countOrdersByStatus,
  displayOrderStatus,
  matchesOrderFilter,
} from "../../config/orders.js";
import "./AdminPage.css";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("ko-KR");
}

function orderItemLabel(order) {
  const first = order.items?.[0]?.name || "상품 없음";
  const extra = (order.items?.length || 0) > 1 ? ` 외 ${order.items.length - 1}건` : "";
  const quantity = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  return `${first}${extra} · ${quantity}개`;
}

function AdminOrderPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("loading");
  const [filter, setFilter] = useState("전체");
  const [message, setMessage] = useState("");

  const visibleOrders = useMemo(
    () => orders.filter((order) => matchesOrderFilter(order, filter)),
    [orders, filter],
  );

  useEffect(() => {
    if (!user || user.user_type !== "admin") {
      return undefined;
    }

    let cancelled = false;
    setStatus("loading");

    fetchOrders("all")
      .then((list) => {
        if (cancelled) return;
        setOrders(list);
        setStatus("ready");
      })
      .catch((error) => {
        if (cancelled) return;
        setStatus("error");
        setMessage(error.message);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user || user.user_type !== "admin") {
    return <Navigate to="/" replace />;
  }

  async function handleStatusChange(order, nextStatus) {
    try {
      const updated = await updateOrder(order._id, { status: nextStatus });
      setOrders((current) => current.map((item) => (item._id === updated._id ? updated : item)));
      setMessage(`${updated.orderNumber} 상태를 ${displayOrderStatus(updated.status)}(으)로 바꿨습니다.`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="admin-page">
      <ShopHeader />
      <section className="admin-wrap">
        <div className="admin-heading">
          <div>
            <p className="eyebrow">Admin</p>
            <h1>주문 관리</h1>
            <p className="lede">모든 회원의 주문을 한곳에서 확인하고 상태를 바꿀 수 있습니다.</p>
          </div>
          <div className="admin-heading-actions">
            <Link className="text-link admin-back" to="/admin">
              어드민으로
            </Link>
          </div>
        </div>

        <div className="admin-stats admin-order-stats">
          <article>
            <strong>{status === "ready" ? orders.length : "-"}</strong>
            <span>전체 주문</span>
          </article>
          {ORDER_STATUS_FILTERS.map((item) => (
            <article key={item}>
              <strong>{status === "ready" ? countOrdersByStatus(orders, item) : "-"}</strong>
              <span>{item}</span>
            </article>
          ))}
        </div>

        {message ? <p className="admin-message">{message}</p> : null}
        {status === "loading" ? <p className="lede">전체 주문을 불러오는 중입니다.</p> : null}
        {status === "error" ? <p className="form-message form-message-error">{message}</p> : null}
        {status === "ready" && orders.length === 0 ? (
          <p className="lede">아직 접수된 주문이 없습니다.</p>
        ) : null}

        {status === "ready" && orders.length > 0 ? (
          <>
            <div className="admin-order-filters" role="tablist" aria-label="주문 상태">
              {["전체", ...ORDER_STATUS_FILTERS].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`admin-order-filter${filter === item ? " is-active" : ""}`}
                  onClick={() => setFilter(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            {visibleOrders.length === 0 ? (
              <p className="lede">{filter} 주문이 없습니다.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>주문번호</th>
                      <th>주문자</th>
                      <th>상품</th>
                      <th>금액</th>
                      <th>상태</th>
                      <th>주문일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleOrders.map((order) => (
                      <tr key={order._id}>
                        <td>
                          <Link to={`/orders/${order._id}`}>{order.orderNumber}</Link>
                        </td>
                        <td>
                          <strong>{order.user?.name || "-"}</strong>
                          <span className="admin-order-email">{order.user?.email || ""}</span>
                        </td>
                        <td>{orderItemLabel(order)}</td>
                        <td>{formatOrderPayment(order)}</td>
                        <td>
                          <OrderStatusSelect
                            status={order.status}
                            onChange={(nextStatus) => handleStatusChange(order, nextStatus)}
                          />
                        </td>
                        <td>{formatDate(order.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : null}
      </section>
      <ShopFooter />
    </div>
  );
}

export default AdminOrderPage;
