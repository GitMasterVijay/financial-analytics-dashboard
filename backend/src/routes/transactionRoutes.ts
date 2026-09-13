import { Router } from 'express';
import { exportCsv, listTransactions } from '../controllers/transactionController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticate, listTransactions);
router.get('/export/csv', authenticate, exportCsv);

export default router;
