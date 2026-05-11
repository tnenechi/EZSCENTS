import express from 'express';
import {
  getActivePromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from '../controllers/promotionController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(getActivePromotions).post(protect, admin, createPromotion);
router
  .route('/:id')
  .put(protect, admin, updatePromotion)
  .delete(protect, admin, deletePromotion);

export default router;
