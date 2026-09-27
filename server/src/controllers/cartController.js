import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

function parseQuantity(value, fallback = 1) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const quantity = Number(value);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    return null;
  }

  return quantity;
}

async function loadCart(userId) {
  return Cart.findOne({ user: userId }).populate("items.product");
}

function sendInvalidQuantity(res) {
  return res.status(400).json({ message: "수량은 1에서 99 사이의 정수여야 합니다." });
}

export async function getCart(req, res, next) {
  try {
    const cart = await loadCart(req.user._id);
    if (!cart) {
      return res.json({ user: req.user._id, items: [] });
    }

    res.json(cart);
  } catch (error) {
    next(error);
  }
}

export async function createCart(req, res, next) {
  try {
    const existing = await Cart.findOne({ user: req.user._id });
    if (existing) {
      return res.status(409).json({ message: "장바구니가 이미 있습니다." });
    }

    const items = [];
    for (const entry of req.body.items || []) {
      const quantity = parseQuantity(entry.quantity);
      if (quantity === null) {
        return sendInvalidQuantity(res);
      }

      const product = await Product.findById(entry.product);
      if (!product) {
        return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
      }

      items.push({ product: product._id, quantity });
    }

    const cart = await Cart.create({ user: req.user._id, items });
    res.status(201).json(await loadCart(cart.user));
  } catch (error) {
    next(error);
  }
}

export async function updateCart(req, res, next) {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "장바구니를 찾을 수 없습니다." });
    }

    if (!Array.isArray(req.body.items)) {
      return res.status(400).json({ message: "items 배열이 필요합니다." });
    }

    const items = [];
    for (const entry of req.body.items) {
      const quantity = parseQuantity(entry.quantity);
      if (quantity === null) {
        return sendInvalidQuantity(res);
      }

      const product = await Product.findById(entry.product);
      if (!product) {
        return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
      }

      items.push({ product: product._id, quantity });
    }

    cart.items = items;
    await cart.save();
    res.json(await loadCart(req.user._id));
  } catch (error) {
    next(error);
  }
}

export async function deleteCart(req, res, next) {
  try {
    const cart = await Cart.findOneAndDelete({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "장바구니를 찾을 수 없습니다." });
    }

    res.json({ message: "장바구니를 비웠습니다.", cart });
  } catch (error) {
    next(error);
  }
}

export async function addCartItem(req, res, next) {
  try {
    const quantity = parseQuantity(req.body.quantity);
    if (quantity === null) {
      return sendInvalidQuantity(res);
    }

    const product = await Product.findById(req.body.product);
    if (!product) {
      return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const existing = cart.items.find((item) => String(item.product) === String(product._id));
    if (existing) {
      const nextQuantity = existing.quantity + quantity;
      if (nextQuantity > 99) {
        return res.status(400).json({ message: "수량은 99개를 넘을 수 없습니다." });
      }
      existing.quantity = nextQuantity;
    } else {
      cart.items.push({ product: product._id, quantity });
    }

    await cart.save();
    res.status(201).json(await loadCart(req.user._id));
  } catch (error) {
    next(error);
  }
}

export async function updateCartItem(req, res, next) {
  try {
    const quantity = parseQuantity(req.body.quantity);
    if (quantity === null) {
      return sendInvalidQuantity(res);
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "장바구니를 찾을 수 없습니다." });
    }

    const item = cart.items.find((entry) => String(entry.product) === req.params.productId);
    if (!item) {
      return res.status(404).json({ message: "장바구니에 없는 상품입니다." });
    }

    item.quantity = quantity;
    await cart.save();
    res.json(await loadCart(req.user._id));
  } catch (error) {
    next(error);
  }
}

export async function deleteCartItem(req, res, next) {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "장바구니를 찾을 수 없습니다." });
    }

    const nextItems = cart.items.filter((entry) => String(entry.product) !== req.params.productId);
    if (nextItems.length === cart.items.length) {
      return res.status(404).json({ message: "장바구니에 없는 상품입니다." });
    }

    cart.items = nextItems;
    await cart.save();
    res.json(await loadCart(req.user._id));
  } catch (error) {
    next(error);
  }
}
