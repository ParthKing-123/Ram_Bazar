import express from 'express';
import { authStaff, seedStaff } from '../controllers/authController.js';

const router = express.Router();

router.post('/staff/login', authStaff);
router.post('/staff/seed', seedStaff);

export default router;
