import { Router } from "express";
import authRouter from "./auth.js";
import cartRouter from "./cart.js";
import ordersRouter from "./orders.js";
import productsRouter from "./products.js";
import usersRouter from "./users.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "harry-potter-shop-api",
    timestamp: new Date().toISOString(),
  });
});

router.use("/auth", authRouter);
router.use("/cart", cartRouter);
router.use("/orders", ordersRouter);
router.use("/products", productsRouter);
router.use("/users", usersRouter);

export default router;
