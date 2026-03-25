import express from 'express';
import { createCustomer, loginCustomer } from '../controllers/customerController.js';

const router = express.Router();

router.route('/').post(createCustomer);
router.post('/login', loginCustomer);

export default router;
