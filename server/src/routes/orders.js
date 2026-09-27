import { Router } from "express";
import { createOrder, getOrder, getOrders, updateOrder } from "../controllers/orderController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", getOrders);
router.post("/", createOrder);
router.get("/:id", getOrder);
router.put("/:id", requireAdmin, updateOrder);

export default router;
