import mongoose, { Schema } from 'mongoose';

const variantSchema = new Schema({
  size: { type: String, required: true }, // e.g., '50ml', '100ml'
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 }
});

const productSchema = new Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  images: [{ type: String }], // URLs from Cloudinary
  variants: [variantSchema],
  isFeatured: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
