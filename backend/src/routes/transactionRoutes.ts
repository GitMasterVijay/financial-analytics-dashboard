import { Router } from 'express';
import { exportCsv, listTransactions } from '../controllers/transactionController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/export/csv', authenticate, exportCsv);
router.get('/', authenticate, listTransactions);

export default router;
