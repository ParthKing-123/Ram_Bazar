import express from 'express';
import { createCustomer, loginCustomer, checkCustomer } from '../controllers/customerController.js';

const router = express.Router();

router.route('/').post(createCustomer);
router.post('/login', loginCustomer);
router.post('/check', checkCustomer);

export default router;
