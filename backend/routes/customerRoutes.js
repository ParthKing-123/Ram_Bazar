import express from 'express';
import { 
  createCustomer, 
  loginCustomer, 
  updateCustomer, 
  getCustomer,
  checkCustomer,
  claimReward
} from '../controllers/customerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/check', checkCustomer);
router.post('/', createCustomer);
router.post('/login', loginCustomer);
router.put('/:id', protect, updateCustomer);
router.get('/:id', protect, getCustomer);
router.post('/:id/claim', protect, claimReward);

export default router;
