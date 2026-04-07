import express from 'express';
import { createOrder, getOrders, updateOrder, getCustomerOrders, rateOrder } from '../controllers/orderController.js';
import { protect, adminGuard, riderGuard } from '../middleware/authMiddleware.js';

const router = express.Router();

// Must be before /:id to avoid route conflicts
router.route('/customer/:id').get(protect, getCustomerOrders);
router.route('/:id/rate').put(protect, rateOrder);

router.route('/').post(protect, createOrder).get(protect, riderGuard, getOrders);
router.route('/:id').put(protect, riderGuard, updateOrder);

export default router;

