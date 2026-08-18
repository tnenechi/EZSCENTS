import express from "express";
import {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
  getOrders,
  updateOrderToDelivered,
  deleteOrder,
  deleteOrders,
} from "../controllers/orderController";
import { protect, admin, tryProtect } from "../middleware/authMiddleware";
import { validateBody } from "../middleware/validate";
import { addOrderSchema } from "../validation/schemas";

const router = express.Router();

router.post("/", tryProtect, validateBody(addOrderSchema), addOrderItems);
router.get("/", protect, admin, getOrders);
router.delete("/", protect, admin, deleteOrders);
router.get("/myorders", protect, getMyOrders);
router.get("/:id", tryProtect, getOrderById);
router.put("/:id/pay", protect, admin, updateOrderToPaid);
router.put("/:id/deliver", protect, admin, updateOrderToDelivered);
router.delete("/:id", protect, admin, deleteOrder);

export default router;
