export const CURRENCIES = [
  { code: "KRW", label: "원화" },
  { code: "JPY", label: "엔화" },
];

export const KRW_PER_JPY = Number(import.meta.env.VITE_KRW_PER_JPY) || 9.5;

export function toChargeAmount(krwAmount, currency) {
  const amount = Number(krwAmount) || 0;
  if (currency === "JPY") {
    return Math.max(1, Math.round(amount / KRW_PER_JPY));
  }
  return amount;
}

export function formatCharge(amount, currency = "KRW") {
  const value = Number(amount) || 0;
  if (currency === "JPY") {
    return `¥${value.toLocaleString("ja-JP")} (세금포함)`;
  }
  return `₩${value.toLocaleString("ko-KR")} (세금포함)`;
}

export function formatMoneyFromKrw(krwAmount, currency = "KRW") {
  return formatCharge(toChargeAmount(krwAmount, currency), currency);
}

export function formatOrderPayment(order) {
  const currency = order?.payment?.currency || "KRW";
  const amount = order?.payment?.chargedAmount ?? order?.total ?? 0;
  return formatCharge(amount, currency);
}
