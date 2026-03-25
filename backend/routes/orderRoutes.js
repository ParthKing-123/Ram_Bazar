import express from 'express';
import { createOrder, getOrders, updateOrder, getCustomerOrders } from '../controllers/orderController.js';

const router = express.Router();

router.route('/').post(createOrder).get(getOrders);
router.route('/:id').put(updateOrder);
router.route('/customer/:id').get(getCustomerOrders);

export default router;
