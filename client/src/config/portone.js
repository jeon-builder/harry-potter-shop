export const PORTONE_STORE_ID =
  import.meta.env.VITE_PORTONE_IMP_CODE || "store-03bbc741-785a-47bf-9431-53e2f6c7de9c";
export const PORTONE_CHANNEL_KEY = import.meta.env.VITE_PORTONE_CHANNEL_KEY || "";
export const PORTONE_CHANNEL_KEY_JPY = import.meta.env.VITE_PORTONE_CHANNEL_KEY_JPY || "";

export function hasPortOneChannel() {
  return Boolean(PORTONE_CHANNEL_KEY || PORTONE_CHANNEL_KEY_JPY);
}

export function channelKeyFor(currency) {
  if (currency === "JPY") return PORTONE_CHANNEL_KEY_JPY;
  return PORTONE_CHANNEL_KEY;
}

export function usesPaypalForJpy() {
  return usesPaypalCheckout("JPY");
}

export function usesPaypalCheckout(currency = "KRW") {
  return currency === "JPY" && Boolean(PORTONE_CHANNEL_KEY_JPY);
}

export function canChargeCurrency(currency) {
  return Boolean(channelKeyFor(currency));
}

export function initPortOne() {
  return window.PortOne || null;
}

function toPortOneCurrency(currency) {
  if (currency === "KRW") return "CURRENCY_KRW";
  if (currency === "JPY") return "CURRENCY_JPY";
  return currency;
}

function toPortOnePhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.startsWith("81") && digits.length >= 11) return `+${digits}`;
  if (/^0[789]0\d{8}$/.test(digits)) return `+81${digits.slice(1)}`;
  if (/^010\d{8}$/.test(digits)) return `+82${digits.slice(1)}`;
  return digits;
}

function customerFromBuyer({ buyer_email, buyer_name, buyer_tel }) {
  return {
    fullName: buyer_name,
    phoneNumber: toPortOnePhone(buyer_tel),
    email: buyer_email,
  };
}

function toPaymentId(merchantUid) {
  return merchantUid.startsWith("payment-") ? merchantUid : `payment-${merchantUid}`;
}

export async function requestPortOnePay({
  merchant_uid,
  name,
  amount,
  currency = "KRW",
  buyer_email,
  buyer_name,
  buyer_tel,
}) {
  const PortOne = window.PortOne;
  if (!PortOne) {
    throw new Error("결제 모듈을 불러오지 못했습니다. 페이지를 새로고침해 주세요.");
  }

  const channelKey = channelKeyFor(currency);
  if (!channelKey) {
    throw new Error(
      currency === "JPY"
        ? "지금 연결된 채널은 KG이니시스라 엔화를 받을 수 없습니다. 원화로 결제하세요."
        : "채널키가 없습니다. 포트원 콘솔 → 결제 연동 → 채널 관리에서 channel-key-로 시작하는 값을 복사해 client/.env에 넣고 Vite를 재시작하세요.",
    );
  }

  const response = await PortOne.requestPayment({
    storeId: PORTONE_STORE_ID,
    channelKey,
    paymentId: toPaymentId(merchant_uid),
    orderName: name,
    totalAmount: amount,
    currency: toPortOneCurrency(currency),
    payMethod: "CARD",
    customer: customerFromBuyer({ buyer_email, buyer_name, buyer_tel }),
  });

  if (response.code != null) {
    throw new Error(response.message || "결제가 취소되었습니다.");
  }

  return {
    imp_uid: response.txId || response.paymentId,
    merchant_uid: response.paymentId || merchant_uid,
    pay_method: "card",
  };
}

export function paypalPaymentRequest({
  paymentId,
  name,
  amount,
  currency = "KRW",
  buyer_email,
  buyer_name,
  buyer_tel,
}) {
  return {
    uiType: "PAYPAL_SPB",
    storeId: PORTONE_STORE_ID,
    channelKey: channelKeyFor(currency),
    paymentId: toPaymentId(paymentId),
    orderName: name,
    totalAmount: amount,
    currency: toPortOneCurrency(currency),
    customer: customerFromBuyer({ buyer_email, buyer_name, buyer_tel }),
  };
}

export async function loadPortOnePaypalUI(request, { onSuccess, onFail }) {
  const PortOne = window.PortOne;
  if (!PortOne) {
    throw new Error("결제 모듈을 불러오지 못했습니다. 페이지를 새로고침해 주세요.");
  }
  if (!request.channelKey) {
    throw new Error("결제용 채널키가 없습니다.");
  }

  return PortOne.loadPaymentUI(request, {
    onPaymentSuccess: onSuccess,
    onPaymentFail: (error) => {
      onFail(new Error(error?.message || "페이팔 결제가 취소되었습니다."));
    },
  });
}

export function updatePortOnePaypalUI(request) {
  window.PortOne?.updateLoadPaymentUIRequest?.(request);
}
