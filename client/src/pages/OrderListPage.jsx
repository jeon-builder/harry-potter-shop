import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchOrders } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.jsx";
import ShopFooter from "../components/ShopFooter.jsx";
import ShopHeader from "../components/ShopHeader.jsx";
import { formatOrderPayment } from "../config/currency.js";
import { ORDER_STATUS_FILTERS, displayOrderStatus, matchesOrderFilter, orderStatusClass } from "../config/orders.js";
import "./CartPage.css";
import "./CheckoutPage.css";
import "./OrderSuccessPage.css";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("ko-KR");
}

function OrderListPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState(user ? "loading" : "guest");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("전체");

  const visibleOrders = useMemo(
    () => orders.filter((order) => matchesOrderFilter(order, filter)),
    [orders, filter],
  );

  useEffect(() => {
    if (!user) {
      setStatus("guest");
      return undefined;
    }

    let cancelled = false;
    setStatus("loading");

    fetchOrders()
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

  return (
    <div className="shop-page">
      <ShopHeader />
      <main className="cart-wrap">
        <p className="eyebrow">Orders</p>
        <h1>주문 내역</h1>

        {status === "guest" ? (
          <section className="cart-empty">
            <p className="lede">주문 내역을 보려면 로그인하세요.</p>
            <Link className="button" to="/login" state={{ from: "/orders" }}>
              로그인
            </Link>
          </section>
        ) : null}

        {status === "loading" ? <p className="lede">주문을 불러오는 중입니다.</p> : null}
        {status === "error" ? <p className="form-message form-message-error">{message}</p> : null}

        {status === "ready" && orders.length === 0 ? (
          <section className="cart-empty">
            <p className="lede">아직 주문한 상품이 없습니다.</p>
            <Link className="button" to="/#pickup">
              상품 보러 가기
            </Link>
          </section>
        ) : null}

        {status === "ready" && orders.length > 0 ? (
          <>
            <div className="order-filters" role="tablist" aria-label="주문 상태">
              {["전체", ...ORDER_STATUS_FILTERS].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`order-filter${filter === item ? " is-active" : ""}`}
                  onClick={() => setFilter(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            {visibleOrders.length === 0 ? (
              <p className="lede">{filter} 주문이 없습니다.</p>
            ) : (
              <div className="order-list">
                {visibleOrders.map((order) => (
                  <Link key={order._id} className="order-card" to={`/orders/${order._id}`}>
                    <span className={`order-status is-${orderStatusClass(order.status)}`}>
                      {displayOrderStatus(order.status)}
                    </span>
                    <strong>{order.orderNumber}</strong>
                    <p>{formatDate(order.createdAt)}</p>
                    <p>
                      {order.items[0]?.name}
                      {order.items.length > 1 ? ` 외 ${order.items.length - 1}건` : ""} ·{" "}
                      {formatOrderPayment(order)}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : null}
      </main>
      <ShopFooter />
    </div>
  );
}

export default OrderListPage;
