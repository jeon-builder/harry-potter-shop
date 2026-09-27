import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { fetchOrder, updateOrder } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.jsx";
import OrderStatusSelect from "../components/OrderStatusSelect.jsx";
import ShopFooter from "../components/ShopFooter.jsx";
import ShopHeader from "../components/ShopHeader.jsx";
import { formatOrderPayment, formatMoneyFromKrw } from "../config/currency.js";
import { displayOrderStatus, orderStatusClass } from "../config/orders.js";
import "./CartPage.css";
import "./CheckoutPage.css";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("ko-KR");
}

function OrderDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState(user ? "loading" : "guest");
  const [message, setMessage] = useState(location.state?.notice || "");
  const [saving, setSaving] = useState(false);
  const isAdmin = user?.user_type === "admin";

  useEffect(() => {
    if (!user) {
      setStatus("guest");
      return undefined;
    }

    let cancelled = false;
    setStatus("loading");

    fetchOrder(id)
      .then((data) => {
        if (cancelled) return;
        setOrder(data);
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
  }, [id, user]);

  async function handleStatusChange(nextStatus) {
    if (!order) return;
    setSaving(true);
    try {
      const updated = await updateOrder(order._id, { status: nextStatus });
      setOrder(updated);
      setMessage(`주문 상태를 ${displayOrderStatus(updated.status)}(으)로 바꿨습니다.`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="shop-page">
      <ShopHeader />
      <main className="cart-wrap">
        <p className="eyebrow">Order</p>
        <h1>주문 상세</h1>

        {status === "guest" ? (
          <section className="cart-empty">
            <p className="lede">주문을 보려면 로그인하세요.</p>
            <Link className="button" to="/login" state={{ from: `/orders/${id}` }}>
              로그인
            </Link>
          </section>
        ) : null}

        {status === "loading" ? <p className="lede">주문을 불러오는 중입니다.</p> : null}
        {status === "error" ? (
          <section className="cart-empty">
            <p className="form-message form-message-error">{message}</p>
            <Link className="text-link" to="/orders">
              주문 내역으로
            </Link>
          </section>
        ) : null}

        {status === "ready" && order ? (
          <>
            {message ? <p className="cart-message">{message}</p> : null}
            <p className={`order-status is-${orderStatusClass(order.status)}`}>
              {displayOrderStatus(order.status)}
            </p>
            <p className="order-meta">{order.orderNumber}</p>
            <p className="order-meta">{formatDate(order.createdAt)}</p>
            {isAdmin ? (
              <div className="order-status-manage">
                <OrderStatusSelect
                  status={order.status}
                  disabled={saving}
                  onChange={handleStatusChange}
                />
              </div>
            ) : null}

            <ul className="cart-list">
              {order.items.map((item) => (
                <li key={`${item.sku}-${item.name}`} className="cart-item">
                  {item.product ? (
                    <Link className="cart-item-media" to={`/products/${item.product}`}>
                      <img src={item.image} alt={item.name} />
                    </Link>
                  ) : (
                    <div className="cart-item-media">
                      <img src={item.image} alt={item.name} />
                    </div>
                  )}
                  <div className="cart-item-body">
                    <p className="cart-item-meta">
                      {item.sku} · {item.quantity}개
                    </p>
                    <h2>{item.name}</h2>
                    <p>{formatMoneyFromKrw(item.price, "KRW")}</p>
                  </div>
                  <p className="cart-item-total">{formatMoneyFromKrw(item.price * item.quantity, "KRW")}</p>
                </li>
              ))}
            </ul>

            <section className="order-block">
              <h2>배송 정보</h2>
              <p>{order.recipient.name}</p>
              <p>{order.recipient.phone}</p>
              <p>{order.recipient.address}</p>
            </section>

            <section className="order-block">
              <h2>결제 정보</h2>
              <p>
                <strong>{formatOrderPayment(order)}</strong>
              </p>
              {order.payment?.currency && order.payment.currency !== "KRW" ? (
                <p>상품 금액 {formatMoneyFromKrw(order.total, "KRW")}</p>
              ) : null}
              {order.payment?.method ? <p>{order.payment.method}</p> : null}
              {order.payment?.impUid ? <p>결제번호 {order.payment.impUid}</p> : null}
            </section>

            <Link className="button" to={isAdmin ? "/admin/orders" : "/orders"}>
              {isAdmin ? "주문 관리로" : "주문 내역 보기"}
            </Link>
          </>
        ) : null}
      </main>
      <ShopFooter />
    </div>
  );
}

export default OrderDetailPage;
