import { Request, Response } from 'express';
import Order from '../models/Order';
import { sendOrderConfirmation, sendOrderStatusUpdate } from '../services/emailService';

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
export const addOrderItems = async (req: Request, res: Response) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    totalPrice,
    guestInfo,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400).json({ message: 'No order items' });
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
    await createdOrder.populate('user', 'name email');
  }

  // Trigger Email (Async)
  sendOrderConfirmation(createdOrder);

  res.status(201).json(createdOrder);
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Public
export const getOrderById = async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ message: 'Order not found' });
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
      id: 'MANUAL_' + Date.now(),
      status: 'COMPLETED',
      update_time: new Date().toISOString(),
      email_address: (req as any).user?.email || 'admin@ezscents.com',
      reference: 'ADMIN_VERIFIED',
    };
    
    order.status = 'Processing';

    const updatedOrder = await order.save();
    
    // Populate user for status update email
    if (updatedOrder.user) {
      await updatedOrder.populate('user', 'name email');
    }
    
    sendOrderStatusUpdate(updatedOrder);

    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req: Request, res: Response) => {
  const orders = await Order.find({ user: (req as any).user._id }).populate('user', 'name email');
  res.json(orders);
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req: Request, res: Response) => {
  const orders = await Order.find({}).populate('user', 'name email');
  res.json(orders);
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
export const updateOrderToDelivered = async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = new Date();
    order.status = 'Delivered';

    const updatedOrder = await order.save();
    
    // Populate user for status update email
    if (updatedOrder.user) {
      await updatedOrder.populate('user', 'name email');
    }
    
    sendOrderStatusUpdate(updatedOrder);

    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};
