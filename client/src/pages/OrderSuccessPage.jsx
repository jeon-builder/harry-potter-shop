import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchOrder } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.jsx";
import ShopFooter from "../components/ShopFooter.jsx";
import ShopHeader from "../components/ShopHeader.jsx";
import { formatOrderPayment } from "../config/currency.js";
import { displayOrderStatus, orderStatusClass } from "../config/orders.js";
import "./CartPage.css";
import "./CheckoutPage.css";
import "./OrderSuccessPage.css";

function OrderSuccessPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState(user ? "loading" : "guest");
  const [message, setMessage] = useState("");

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

  return (
    <div className="shop-page order-success-page">
      <ShopHeader />
      <main className="cart-wrap">
        {status === "guest" ? (
          <section className="cart-empty">
            <p className="lede">주문 결과를 보려면 로그인하세요.</p>
            <Link className="button" to="/login" state={{ from: `/orders/${id}/success` }}>
              로그인
            </Link>
          </section>
        ) : null}

        {status === "loading" ? <p className="lede">주문 결과를 불러오는 중입니다.</p> : null}
        {status === "error" ? (
          <section className="cart-empty">
            <p className="form-message form-message-error">{message}</p>
            <Link className="button" to="/orders">
              주문목록
            </Link>
          </section>
        ) : null}

        {status === "ready" && order ? (
          <section className="order-success">
            <p className="eyebrow">Complete</p>
            <h1>주문이 완료되었습니다</h1>
            <p className="lede">결제가 확인되어 주문을 접수했습니다.</p>
            <p className={`order-status is-${orderStatusClass(order.status)}`}>
              {displayOrderStatus(order.status)}
            </p>
            <p className="order-meta">{order.orderNumber}</p>
            <p className="order-success-amount">{formatOrderPayment(order)}</p>
            <p className="order-meta">
              {order.items[0]?.name}
              {order.items.length > 1 ? ` 외 ${order.items.length - 1}건` : ""}
            </p>
            <div className="order-success-actions">
              <Link className="button" to="/orders">
                주문목록
              </Link>
              <Link className="text-link" to={`/orders/${order._id}`}>
                주문 상세 보기
              </Link>
            </div>
          </section>
        ) : null}
      </main>
      <ShopFooter />
    </div>
  );
}

export default OrderSuccessPage;
