import express from 'express';
import {
  getActivePromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from '../controllers/promotionController';
import { protect, admin } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validate';
import { createPromotionSchema, updatePromotionSchema } from '../validation/schemas';

const router = express.Router();

router
  .route('/')
  .get(getActivePromotions)
  .post(protect, admin, validateBody(createPromotionSchema), createPromotion);
router
  .route('/:id')
  .put(protect, admin, validateBody(updatePromotionSchema), updatePromotion)
  .delete(protect, admin, deletePromotion);

export default router;
