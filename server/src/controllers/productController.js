import Product from "../models/Product.js";

function pickProductInput(body) {
  const input = {};

  if (body.sku !== undefined) input.sku = body.sku;
  if (body.name !== undefined) input.name = body.name;
  if (body.price !== undefined) input.price = body.price;
  if (body.category !== undefined) input.category = body.category;
  if (body.image !== undefined) input.image = body.image;
  if (body.description !== undefined) input.description = body.description;

  return input;
}

export async function createProduct(req, res, next) {
  try {
    const product = await Product.create(pickProductInput(req.body));
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
}

export async function getProducts(_req, res, next) {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    next(error);
  }
}

export async function getProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, pickProductInput(req.body), {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
    }

    res.json({ message: "상품을 삭제했습니다.", product });
  } catch (error) {
    next(error);
  }
}
