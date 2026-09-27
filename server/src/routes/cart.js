import { Router } from "express";
import {
  addCartItem,
  createCart,
  deleteCart,
  deleteCartItem,
  getCart,
  updateCart,
  updateCartItem,
} from "../controllers/cartController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", getCart);
router.post("/", createCart);
router.put("/", updateCart);
router.delete("/", deleteCart);

router.post("/items", addCartItem);
router.put("/items/:productId", updateCartItem);
router.delete("/items/:productId", deleteCartItem);

export default router;
