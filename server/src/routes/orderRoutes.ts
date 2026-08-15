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

const router = express.Router();

router.post("/", tryProtect, addOrderItems);
router.get("/", protect, admin, getOrders);
router.delete("/", protect, admin, deleteOrders);
router.get("/myorders", protect, getMyOrders);
router.get("/:id", getOrderById);
router.put("/:id/pay", protect, updateOrderToPaid);
router.put("/:id/deliver", protect, admin, updateOrderToDelivered);
router.delete("/:id", protect, admin, deleteOrder);

export default router;
