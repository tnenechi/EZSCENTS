import { Request, Response } from "express";
import Order from "../models/Order";
import User from "../models/User";
import {
  sendOrderConfirmation,
  sendOrderStatusUpdate,
} from "../services/emailService";
import mongoose from "mongoose";

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
export const addOrderItems = async (req: Request, res: Response) => {
  const { orderItems, shippingAddress, paymentMethod, totalPrice, guestInfo } =
    req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400).json({ message: "No order items" });
    return;
  }

  const order = new Order({
    orderItems,
    user: (req as any).user?._id,
    guestInfo,
    shippingAddress,
    paymentMethod,
    totalPrice,
  });

  const createdOrder = await order.save();

  // Populate user for email confirmation if registered
  if (createdOrder.user) {
    await createdOrder.populate("user", "name email");
  }

  // Trigger Email (Async)
  sendOrderConfirmation(createdOrder);

  res.status(201).json(createdOrder);
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Public
export const getOrderById = async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email",
  );

  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ message: "Order not found" });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = new Date();

    order.paymentResult = {
      id: "MANUAL_" + Date.now(),
      status: "COMPLETED",
      update_time: new Date().toISOString(),
      email_address: (req as any).user?.email || "admin@secretscents.com",
      reference: "ADMIN_VERIFIED",
    };

    order.status = "Processing";

    const updatedOrder = await order.save();

    // Populate user for status update email
    if (updatedOrder.user) {
      await updatedOrder.populate("user", "name email");
    }

    sendOrderStatusUpdate(updatedOrder);

    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: "Order not found" });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req: Request, res: Response) => {
  const orders = await Order.find({ user: (req as any).user._id }).populate(
    "user",
    "name email",
  );
  res.json(orders);
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req: Request, res: Response) => {
  const { keyword, isPaid, isDispatched, status } = req.query;

  let query: any = {};

  // Filtering
  if (isPaid === "true") query.isPaid = true;
  if (isPaid === "false") query.isPaid = false;
  if (isDispatched === "true") query.isDispatched = true;
  if (isDispatched === "false") query.isDispatched = false;

  if (status === "Processing") {
    query.isDispatched = false;
  } else if (status) {
    query.status = status;
  }

  // Searching
  if (keyword) {
    const searchRegex = new RegExp(keyword as string, "i");

    // Find users matching name or email
    const users = await User.find({
      $or: [{ name: searchRegex }, { email: searchRegex }],
    }).select("_id");
    const userIds = users.map((u) => u._id);

    // Build search conditions
    const searchConditions: any[] = [
      { "guestInfo.name": searchRegex },
      { "guestInfo.email": searchRegex },
      { user: { $in: userIds } },
    ];

    // If keyword looks like an ID
    if (mongoose.Types.ObjectId.isValid(keyword as string)) {
      searchConditions.push({ _id: keyword });
    }

    query = {
      ...query,
      $or: searchConditions,
    };
  }

  const pageSize = 12;
  const page = Number(req.query.pageNumber) || 1;

  const count = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ orders, page, pages: Math.ceil(count / pageSize), count });
};

// @desc    Delete an order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
export const deleteOrder = async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    await Order.deleteOne({ _id: order._id });
    res.json({ message: "Order removed" });
  } else {
    res.status(404).json({ message: "Order not found" });
  }
};

// @desc    Delete multiple orders
// @route   DELETE /api/orders
// @access  Private/Admin
export const deleteOrders = async (req: Request, res: Response) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ message: "No order IDs provided" });
    return;
  }

  const result = await Order.deleteMany({ _id: { $in: ids } });
  res.json({ message: "Orders removed", deletedCount: result.deletedCount });
};

// @desc    Update order to dispatched
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
export const updateOrderToDelivered = async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDispatched = true;
    order.dispatchedAt = new Date();
    order.status = "Shipped";

    const updatedOrder = await order.save();

    // Populate user for status update email
    if (updatedOrder.user) {
      await updatedOrder.populate("user", "name email");
    }

    sendOrderStatusUpdate(updatedOrder);

    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: "Order not found" });
  }
};
