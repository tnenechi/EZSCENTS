import express from 'express';
import { registerUser, loginUser, logoutUser, getUserProfile, updateUserPassword, forgotPassword, resetPassword } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { authLimiter } from '../middleware/rateLimit';
import { validateBody } from '../middleware/validate';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema,
} from '../validation/schemas';

const router = express.Router();

router.post('/register', authLimiter, validateBody(registerSchema), registerUser);
router.post('/login', authLimiter, validateBody(loginSchema), loginUser);
router.post('/logout', protect, logoutUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile/password', protect, validateBody(updatePasswordSchema), updateUserPassword);
router.post('/forgot-password', authLimiter, validateBody(forgotPasswordSchema), forgotPassword);
router.put('/reset-password/:token', validateBody(resetPasswordSchema), resetPassword);

export default router;
