import mongoose, { Schema } from 'mongoose';

const promotionSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  image: { type: String, required: true }, // Cloudinary URL
  products: [{ type: Schema.Types.ObjectId, ref: 'Product' }], // Products included in promotion
  isActive: { type: Boolean, default: true },
  startDate: { type: Date },
  endDate: { type: Date }
}, { timestamps: true });

export default mongoose.model('Promotion', promotionSchema);
