import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFilters,
} from '../controllers/productController';
import { protect, admin } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validate';
import { createProductSchema, updateProductSchema } from '../validation/schemas';

const router = express.Router();

router
  .route('/')
  .get(getProducts)
  .post(protect, admin, validateBody(createProductSchema), createProduct);
router.route('/filters').get(getFilters);
router
  .route('/:id')
  .get(getProductById)
  .put(protect, admin, validateBody(updateProductSchema), updateProduct)
  .delete(protect, admin, deleteProduct);

export default router;
