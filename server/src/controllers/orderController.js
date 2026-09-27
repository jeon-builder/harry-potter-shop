import Cart from "../models/Cart.js";
import Order, { ORDER_STATUSES } from "../models/Order.js";

function createOrderNumber() {
  return `HP-${Date.now().toString(36).toUpperCase()}`;
}

function toPublicOrder(order) {
  return order;
}

export async function createOrder(req, res, next) {
  try {
    const name = String(req.body.name || "").trim();
    const phone = String(req.body.phone || "").trim();
    const address = String(req.body.address || "").trim();
    const impUid = String(req.body.impUid || "").trim();
    const merchantUid = String(req.body.merchantUid || "").trim();
    const payMethod = String(req.body.payMethod || "").trim();
    const currency = req.body.currency === "JPY" ? "JPY" : "KRW";
    const chargedAmount = Number(req.body.chargedAmount);

    if (!name || !phone || !address) {
      return res.status(400).json({ message: "받는 분 이름, 전화번호, 주소는 필수입니다." });
    }

    if (!impUid || !merchantUid) {
      return res.status(400).json({ message: "결제가 완료되지 않았습니다." });
    }

    if (phone.length < 8) {
      return res.status(400).json({ message: "전화번호를 정확히 입력하세요." });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    const lines = (cart?.items || []).filter((item) => item.product);

    if (!lines.length) {
      return res.status(400).json({ message: "가방이 비어 있어 주문할 수 없습니다." });
    }

    const items = lines.map((item) => ({
      product: item.product._id,
      sku: item.product.sku,
      name: item.product.name,
      image: item.product.image,
      price: item.product.price,
      quantity: item.quantity,
    }));
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await Order.create({
      orderNumber: createOrderNumber(),
      user: req.user._id,
      items,
      recipient: { name, phone, address },
      total,
      payment: {
        impUid,
        merchantUid,
        method: payMethod,
        currency,
        chargedAmount: Number.isFinite(chargedAmount) && chargedAmount > 0 ? chargedAmount : total,
      },
      status: "주문확인",
    });

    cart.items = [];
    await cart.save();

    res.status(201).json(toPublicOrder(order));
  } catch (error) {
    next(error);
  }
}

export async function getOrders(req, res, next) {
  try {
    const filter =
      req.user.user_type === "admin" && req.query.scope === "all" ? {} : { user: req.user._id };

    const orders = await Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    next(error);
  }
}

export async function getOrder(req, res, next) {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) {
      return res.status(404).json({ message: "주문을 찾을 수 없습니다." });
    }

    if (req.user.user_type !== "admin" && String(order.user._id || order.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "다른 사람의 주문은 볼 수 없습니다." });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
}

export async function updateOrder(req, res, next) {
  try {
    const status = String(req.body.status || "").trim();
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ message: "올바르지 않은 주문 상태입니다." });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true },
    ).populate("user", "name email");

    if (!order) {
      return res.status(404).json({ message: "주문을 찾을 수 없습니다." });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
}
