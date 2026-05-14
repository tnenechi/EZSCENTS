import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const addressSchema = new Schema({
  street: String,
  city: String,
  state: String,
  country: { type: String, default: "Nigeria" },
  zipCode: String,
  isDefault: { type: Boolean, default: false },
});

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    addresses: [addressSchema],
  },
  { timestamps: true },
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt);
});

// Match password method
userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
