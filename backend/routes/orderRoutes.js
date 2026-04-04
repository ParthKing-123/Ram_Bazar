import express from 'express';
import { createOrder, getOrders, updateOrder, getCustomerOrders, rateOrder } from '../controllers/orderController.js';

const router = express.Router();

router.route('/').post(createOrder).get(getOrders);
router.route('/:id').put(updateOrder);
router.route('/customer/:id').get(getCustomerOrders);
router.route('/:id/rate').put(rateOrder);

export default router;
