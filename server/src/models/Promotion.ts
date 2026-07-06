import mongoose, { Schema } from "mongoose";

const promotionSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    image: { type: Schema.Types.Mixed, required: true }, // Cloudinary URL or { url, publicId }
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }], // Products included in promotion
    isActive: { type: Boolean, default: true },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true },
);

export default mongoose.model("Promotion", promotionSchema);
