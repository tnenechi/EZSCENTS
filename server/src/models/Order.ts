import mongoose, { Schema } from 'mongoose';

const orderItemSchema = new Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  variantId: { type: String, required: true },
  size: { type: String, required: true },
});

const shippingAddressSchema = new Schema({
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true, default: 'Nigeria' },
  phone: { type: String, required: true },
});

const orderSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Allow guest checkout
  },
  guestInfo: {
    name: String,
    email: String,
  },
  orderItems: [orderItemSchema],
  shippingAddress: shippingAddressSchema,
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Bank Transfer'],
    default: 'Bank Transfer',
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String,
    reference: String,
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0,
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false,
  },
  paidAt: {
    type: Date,
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false,
  },
  deliveredAt: {
    type: Date,
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
