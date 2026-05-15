import express from "express";
import {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
  getOrders,
  updateOrderToDelivered,
} from "../controllers/orderController";
import { protect, admin, tryProtect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", tryProtect, addOrderItems);
router.get("/", protect, admin, getOrders);
router.get("/myorders", protect, getMyOrders);
router.get("/:id", getOrderById);
router.put("/:id/pay", protect, updateOrderToPaid);
router.put("/:id/deliver", protect, admin, updateOrderToDelivered);

export default router;
