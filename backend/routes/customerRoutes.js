import express from 'express';
import { createCustomer, loginCustomer, checkCustomer, updateCustomer } from '../controllers/customerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(createCustomer);
router.route('/:id').put(protect, updateCustomer);
router.post('/login', loginCustomer);
router.post('/check', checkCustomer);

export default router;

