import { z } from "zod";

// ---- Auth ----

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().max(200).pipe(z.email()),
  password: z.string().min(6).max(200),
});

export const loginSchema = z.object({
  email: z.string().trim().max(200).pipe(z.email()),
  password: z.string().min(1).max(200),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().max(200).pipe(z.email()),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6).max(200),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(6).max(200),
});

// ---- Orders ----

const orderItemSchema = z.object({
  product: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.number().int().positive(),
  // name/image/price/size are accepted for shape validation but are
  // re-derived from the database in addOrderItems — never trusted as-is.
  name: z.string().min(1),
  image: z.string().min(1),
  price: z.number().nonnegative(),
  size: z.string().min(1),
});

const shippingAddressSchema = z.object({
  address: z.string().trim().min(1).max(300),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
  country: z.string().trim().min(1).max(100).optional(),
  phone: z.string().trim().min(1).max(30),
});

const guestInfoSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().max(200).pipe(z.email()),
});

export const addOrderSchema = z.object({
  orderItems: z.array(orderItemSchema).min(1),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.literal("Bank Transfer"),
  guestInfo: guestInfoSchema.optional(),
  // totalPrice is intentionally not accepted here — it's computed
  // server-side in addOrderItems from authoritative product/variant prices.
});

// ---- Products ----

const imageRefSchema = z.union([
  z.string().min(1),
  z.object({ url: z.string().min(1), publicId: z.string().min(1) }),
]);

const variantSchema = z.object({
  size: z.string().trim().min(1).max(50),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(1).max(200),
  brand: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(5000),
  category: z.string().trim().min(1).max(100),
  images: z.array(imageRefSchema).optional(),
  variants: z.array(variantSchema).min(1),
  isFeatured: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial();

// ---- Promotions ----

export const createPromotionSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  image: imageRefSchema.optional(),
  products: z.array(z.string().min(1)).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const updatePromotionSchema = createPromotionSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// ---- Upload ----

export const uploadImageSchema = z.object({
  image: z.string().min(1),
});
