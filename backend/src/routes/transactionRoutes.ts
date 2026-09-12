import { Router } from 'express';
import { listTransactions } from '../controllers/transactionController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticate, listTransactions);

export default router;
