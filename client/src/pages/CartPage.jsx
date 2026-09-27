import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { deleteCart, deleteCartItem, fetchCart, updateCartItem } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.jsx";
import ShopFooter from "../components/ShopFooter.jsx";
import ShopHeader from "../components/ShopHeader.jsx";
import { formatPrice } from "../data/home.js";
import "./CartPage.css";

function getProduct(item) {
  return item.product && typeof item.product === "object" ? item.product : null;
}

function CartPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [cart, setCart] = useState({ items: [] });
  const [status, setStatus] = useState(user ? "loading" : "guest");
  const [message, setMessage] = useState(location.state?.notice || "");
  const [busyId, setBusyId] = useState("");

  const items = useMemo(
    () => (Array.isArray(cart.items) ? cart.items.filter((item) => getProduct(item)) : []),
    [cart],
  );
  const total = items.reduce((sum, item) => sum + getProduct(item).price * item.quantity, 0);

  useEffect(() => {
    if (!user) {
      setStatus("guest");
      return undefined;
    }

    let cancelled = false;
    setStatus("loading");

    fetchCart()
      .then((data) => {
        if (cancelled) return;
        setCart(data);
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

  async function changeQuantity(item, delta) {
    const product = getProduct(item);
    const quantity = item.quantity + delta;
    if (!product || quantity < 1 || quantity > 99) return;

    setBusyId(product._id);
    try {
      const nextCart = await updateCartItem(product._id, { quantity });
      setCart(nextCart);
      setMessage("");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusyId("");
    }
  }

  async function handleRemove(item) {
    const product = getProduct(item);
    if (!product) return;

    setBusyId(product._id);
    try {
      const nextCart = await deleteCartItem(product._id);
      setCart(nextCart);
      setMessage(`${product.name}을(를) 가방에서 뺐습니다.`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusyId("");
    }
  }

  async function handleClear() {
    if (!items.length || !window.confirm("가방을 모두 비울까요?")) return;

    setBusyId("clear");
    try {
      await deleteCart();
      setCart({ items: [] });
      setMessage("가방을 비웠습니다.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="shop-page cart-page">
      <ShopHeader />

      <main className="cart-wrap">
        <p className="eyebrow">Bag</p>
        <h1>장바구니</h1>

        {status === "guest" ? (
          <section className="cart-empty">
            <p className="lede">가방을 보려면 먼저 로그인하세요.</p>
            <Link className="button" to="/login" state={{ from: "/cart" }}>
              로그인
            </Link>
          </section>
        ) : null}

        {status === "loading" ? <p className="lede">가방을 불러오는 중입니다.</p> : null}
        {status === "error" ? <p className="form-message form-message-error">{message}</p> : null}
        {status === "ready" && message ? <p className="cart-message">{message}</p> : null}

        {status === "ready" && items.length === 0 ? (
          <section className="cart-empty">
            <p className="lede">가방이 비어 있습니다. 마음에 드는 아이템을 담아 보세요.</p>
            <Link className="button" to="/#pickup">
              상품 보러 가기
            </Link>
          </section>
        ) : null}

        {status === "ready" && items.length > 0 ? (
          <div className="cart-layout">
            <ul className="cart-list">
              {items.map((item) => {
                const product = getProduct(item);
                return (
                  <li key={product._id} className="cart-item">
                    <Link className="cart-item-media" to={`/products/${product._id}`}>
                      <img src={product.image} alt={product.name} />
                    </Link>
                    <div className="cart-item-body">
                      <p className="cart-item-meta">{product.category}</p>
                      <h2>
                        <Link to={`/products/${product._id}`}>{product.name}</Link>
                      </h2>
                      <p>{formatPrice(product.price)}</p>
                      <div className="cart-item-actions">
                        <div className="product-qty" role="group" aria-label={`${product.name} 수량`}>
                          <button
                            type="button"
                            onClick={() => changeQuantity(item, -1)}
                            disabled={busyId === product._id || item.quantity <= 1}
                            aria-label="수량 줄이기"
                          >
                            −
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => changeQuantity(item, 1)}
                            disabled={busyId === product._id || item.quantity >= 99}
                            aria-label="수량 늘리기"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          className="ghost-link"
                          onClick={() => handleRemove(item)}
                          disabled={busyId === product._id}
                        >
                          빼기
                        </button>
                      </div>
                    </div>
                    <p className="cart-item-total">{formatPrice(product.price * item.quantity)}</p>
                  </li>
                );
              })}
            </ul>

            <aside className="cart-summary">
              <h2>주문 요약</h2>
              <p>
                <span>상품 {items.length}종</span>
                <strong>{formatPrice(total)}</strong>
              </p>
              <Link className="button" to="/checkout">
                주문하기
              </Link>
              <Link className="text-link cart-clear" to="/#pickup">
                쇼핑 계속하기
              </Link>
              <button type="button" className="ghost-link cart-clear" onClick={handleClear} disabled={Boolean(busyId)}>
                가방 비우기
              </button>
            </aside>
          </div>
        ) : null}
      </main>

      <ShopFooter />
    </div>
  );
}

export default CartPage;
