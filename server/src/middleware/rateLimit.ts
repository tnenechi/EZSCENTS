import rateLimit from "express-rate-limit";

// Applies to /login, /register, /forgot-password — throttles credential
// stuffing, registration/email enumeration, and password-reset email-bombing.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again later." },
});
