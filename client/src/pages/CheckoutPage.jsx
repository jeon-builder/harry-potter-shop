import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createOrder, fetchCart } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.jsx";
import ShopFooter from "../components/ShopFooter.jsx";
import ShopHeader from "../components/ShopHeader.jsx";
import { CURRENCIES, KRW_PER_JPY, formatMoneyFromKrw, toChargeAmount } from "../config/currency.js";
import {
  hasPortOneChannel,
  loadPortOnePaypalUI,
  paypalPaymentRequest,
  requestPortOnePay,
  updatePortOnePaypalUI,
  canChargeCurrency,
  usesPaypalCheckout,
} from "../config/portone.js";
import "./CartPage.css";
import "./CheckoutPage.css";

function getProduct(item) {
  return item.product && typeof item.product === "object" ? item.product : null;
}

function CheckoutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [] });
  const [status, setStatus] = useState(user ? "loading" : "guest");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currency, setCurrency] = useState("KRW");
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: "",
    address: user?.address || "",
  });
  const formRef = useRef(form);
  const paypalReadyRef = useRef(false);
  const paypalPaymentIdRef = useRef("");

  formRef.current = form;

  const items = useMemo(
    () => (Array.isArray(cart.items) ? cart.items.filter((item) => getProduct(item)) : []),
    [cart],
  );
  const totalKrw = items.reduce((sum, item) => sum + getProduct(item).price * item.quantity, 0);
  const chargeAmount = toChargeAmount(totalKrw, currency);
  const orderName = items.length
    ? items.length > 1
      ? `${items[0].product.name} 외 ${items.length - 1}건`
      : items[0].product.name
    : "";
  const showPaypal = usesPaypalCheckout(currency);
  const formReady = Boolean(form.name.trim() && form.phone.trim().length >= 8 && form.address.trim());

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

  useEffect(() => {
    if (!showPaypal || status !== "ready" || !items.length || !formReady || !user) {
      paypalReadyRef.current = false;
      paypalPaymentIdRef.current = "";
      return undefined;
    }

    if (!paypalPaymentIdRef.current) {
      paypalPaymentIdRef.current = `payment-hp-${Date.now()}`;
    }

    const request = paypalPaymentRequest({
      paymentId: paypalPaymentIdRef.current,
      name: orderName,
      amount: chargeAmount,
      currency,
      buyer_email: user.email,
      buyer_name: form.name.trim(),
      buyer_tel: form.phone.trim(),
    });

    let cancelled = false;

    async function finishPaypal(response) {
      const current = formRef.current;
      const name = current.name.trim();
      const phone = current.phone.trim();
      const address = current.address.trim();
      if (!name || !phone || !address) {
        setMessage("배송 정보를 먼저 입력하세요.");
        return;
      }

      const order = await createOrder({
        name,
        phone,
        address,
        impUid: response.txId || response.paymentId,
        merchantUid: response.paymentId || request.paymentId,
        payMethod: "paypal",
        currency,
        chargedAmount: chargeAmount,
      });
      navigate(`/orders/${order._id}/success`, { replace: true });
    }

    if (paypalReadyRef.current) {
      updatePortOnePaypalUI(request);
      return undefined;
    }

    loadPortOnePaypalUI(request, {
      onSuccess: (response) => {
        if (cancelled) return;
        finishPaypal(response).catch((error) => setMessage(error.message));
      },
      onFail: (error) => {
        if (cancelled) return;
        setMessage(error.message);
      },
    })
      .then(() => {
        if (!cancelled) paypalReadyRef.current = true;
      })
      .catch((error) => {
        if (!cancelled) setMessage(error.message);
      });

    return () => {
      cancelled = true;
    };
  }, [showPaypal, status, items.length, formReady, form.name, form.phone, user, orderName, chargeAmount, currency, navigate]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!items.length || showPaypal) return;

    const name = form.name.trim();
    const phone = form.phone.trim();
    const address = form.address.trim();

    setSubmitting(true);
    setMessage("");

    try {
      const payment = await requestPortOnePay({
        merchant_uid: `hp-${Date.now()}`,
        name: orderName,
        amount: chargeAmount,
        currency,
        buyer_email: user.email,
        buyer_name: name,
        buyer_tel: phone,
        buyer_addr: address,
      });

      const order = await createOrder({
        name,
        phone,
        address,
        impUid: payment.imp_uid,
        merchantUid: payment.merchant_uid,
        payMethod: payment.pay_method,
        currency,
        chargedAmount: chargeAmount,
      });
      navigate(`/orders/${order._id}/success`, { replace: true });
    } catch (error) {
      setMessage(error.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="shop-page checkout-page">
      <ShopHeader />

      <main className="cart-wrap">
        <p className="eyebrow">Order</p>
        <h1>주문하기</h1>

        {status === "guest" ? (
          <section className="cart-empty">
            <p className="lede">주문하려면 먼저 로그인하세요.</p>
            <Link className="button" to="/login" state={{ from: "/checkout" }}>
              로그인
            </Link>
          </section>
        ) : null}

        {status === "loading" ? <p className="lede">주문 정보를 불러오는 중입니다.</p> : null}
        {status === "error" ? <p className="form-message form-message-error">{message}</p> : null}

        {status === "ready" && items.length === 0 ? (
          <section className="cart-empty">
            <p className="lede">가방이 비어 있어 주문할 수 없습니다.</p>
            <Link className="button" to="/cart">
              가방으로
            </Link>
          </section>
        ) : null}

        {status === "ready" && items.length > 0 ? (
          <div className="cart-layout">
            <div>
              <ul className="cart-list checkout-list">
                {items.map((item) => {
                  const product = getProduct(item);
                  return (
                    <li key={product._id} className="cart-item">
                      <Link className="cart-item-media" to={`/products/${product._id}`}>
                        <img src={product.image} alt={product.name} />
                      </Link>
                      <div className="cart-item-body">
                        <p className="cart-item-meta">
                          {product.category} · {item.quantity}개
                        </p>
                        <h2>
                          <Link to={`/products/${product._id}`}>{product.name}</Link>
                        </h2>
                        <p>{formatMoneyFromKrw(product.price, currency)}</p>
                      </div>
                      <p className="cart-item-total">
                        {formatMoneyFromKrw(product.price * item.quantity, currency)}
                      </p>
                    </li>
                  );
                })}
              </ul>

              <form className="form checkout-form" onSubmit={handleSubmit}>
                <h2>결제 통화</h2>
                <div className="currency-picker" role="radiogroup" aria-label="결제 통화">
                  {CURRENCIES.map((item) => (
                    <label key={item.code} className={currency === item.code ? "is-active" : ""}>
                      <input
                        type="radio"
                        name="currency"
                        value={item.code}
                        checked={currency === item.code}
                        onChange={() => {
                          setCurrency(item.code);
                          setMessage("");
                          paypalReadyRef.current = false;
                          paypalPaymentIdRef.current = "";
                        }}
                      />
                      <span>
                        {item.label} ({item.code})
                      </span>
                    </label>
                  ))}
                </div>
                {currency === "JPY" ? (
                  <p className="currency-note">
                    상품 가격은 원화 기준이며, 1엔 = {KRW_PER_JPY}원으로 환산합니다.
                  </p>
                ) : null}
                {currency === "JPY" && !canChargeCurrency("JPY") ? (
                  <div className="currency-note">
                    <p className="form-message form-message-error">
                      지금 연결된 채널은 KG이니시스라 엔화를 받을 수 없습니다. 원화로 결제하세요.
                    </p>
                    <button
                      className="text-link"
                      type="button"
                      onClick={() => {
                        setCurrency("KRW");
                        setMessage("");
                        paypalReadyRef.current = false;
                        paypalPaymentIdRef.current = "";
                      }}
                    >
                      원화로 결제하기
                    </button>
                  </div>
                ) : null}

                <h2>배송 정보</h2>
                <label className="field">
                  <span>받는 분 *</span>
                  <input name="name" value={form.name} onChange={handleChange} required autoComplete="name" />
                </label>
                <label className="field">
                  <span>전화번호 *</span>
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    autoComplete="tel"
                    placeholder="010-0000-0000"
                  />
                </label>
                <label className="field">
                  <span>주소 *</span>
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    required
                    autoComplete="street-address"
                  />
                </label>
                {!hasPortOneChannel() ? (
                  <p className="form-message form-message-error">
                    결제창을 열려면 포트원 콘솔 → 결제 연동 → 채널 관리의 채널키를 client/.env의
                    VITE_PORTONE_CHANNEL_KEY에 넣고 Vite를 재시작하세요.
                  </p>
                ) : null}
                {message ? <p className="form-message form-message-error">{message}</p> : null}
                {showPaypal ? (
                  <>
                    {!formReady ? (
                      <p className="currency-note">배송 정보를 입력하면 결제 버튼이 나타납니다.</p>
                    ) : null}
                    <div className={`paypal-slot${formReady ? "" : " is-pending"}`}>
                      <div key={currency} className="portone-ui-container" />
                    </div>
                  </>
                ) : (
                  <button
                    className="button"
                    type="submit"
                    disabled={submitting || !canChargeCurrency(currency)}
                  >
                    {submitting
                      ? "결제창을 여는 중..."
                      : `${formatMoneyFromKrw(totalKrw, currency)} 결제하기`}
                  </button>
                )}
              </form>
            </div>

            <aside className="cart-summary">
              <h2>결제 금액</h2>
              <p>
                <span>상품 {items.length}종</span>
                <strong>{formatMoneyFromKrw(totalKrw, currency)}</strong>
              </p>
              {currency === "JPY" ? (
                <p className="currency-note">원화 기준 {formatMoneyFromKrw(totalKrw, "KRW")}</p>
              ) : null}
              <Link className="text-link cart-clear" to="/cart">
                가방으로 돌아가기
              </Link>
            </aside>
          </div>
        ) : null}
      </main>

      <ShopFooter />
    </div>
  );
}

export default CheckoutPage;
