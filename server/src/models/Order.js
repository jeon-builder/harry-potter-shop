import mongoose from "mongoose";

export const ORDER_STATUSES = [
  "주문확인",
  "상품 준비중",
  "배송시작",
  "배송중",
  "배송완료",
  "주문취소",
  "전처리중",
  "완료",
  "취소",
  "접수",
  "배송준비",
];

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    sku: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 99,
    },
  },
  {
    _id: false,
  },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator(items) {
          return Array.isArray(items) && items.length > 0;
        },
        message: "주문할 상품이 없습니다.",
      },
    },
    recipient: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      address: {
        type: String,
        required: true,
        trim: true,
      },
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    payment: {
      impUid: {
        type: String,
        required: true,
        trim: true,
      },
      merchantUid: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },
      method: {
        type: String,
        trim: true,
      },
      currency: {
        type: String,
        enum: ["KRW", "JPY"],
        default: "KRW",
      },
      chargedAmount: {
        type: Number,
        min: 0,
      },
    },
    status: {
      type: String,
      required: true,
      enum: ORDER_STATUSES,
      default: "주문확인",
    },
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
