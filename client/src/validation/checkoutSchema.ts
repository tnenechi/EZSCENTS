import * as z from "zod";

export const shippingSchema = z.object({
  address: z.string().min(5, "Address is too short"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  phone: z.string().min(10, "Enter a valid phone number"),
  guestName: z.string().optional(),
  guestEmail: z.email("Invalid email").optional().or(z.literal("")),
});

export type ShippingFormValues = z.infer<typeof shippingSchema>;
