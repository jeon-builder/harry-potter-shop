import { Router } from "express";
import {
  createUser,
  deleteUser,
  getMe,
  getUser,
  getUsers,
  loginUser,
  updateUser,
} from "../controllers/userController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/login", loginUser);
router.post("/", createUser);
router.get("/me", requireAuth, getMe);
router.get("/", requireAuth, requireAdmin, getUsers);
router.get("/:id", getUser);
router.put("/:id", requireAuth, requireAdmin, updateUser);
router.delete("/:id", requireAuth, requireAdmin, deleteUser);

export default router;
