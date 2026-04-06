import express from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { protect, adminGuard } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getProducts).post(protect, adminGuard, createProduct);
router.route('/:id').put(protect, adminGuard, updateProduct).delete(protect, adminGuard, deleteProduct);

export default router;
