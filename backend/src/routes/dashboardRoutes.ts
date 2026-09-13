import { Router } from 'express';
import {
  getCategoryBreakdownData,
  getRevenueExpenseTrendData,
  getSummary,
} from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/summary', authenticate, getSummary);
router.get('/revenue-expense-trend', authenticate, getRevenueExpenseTrendData);
router.get('/category-breakdown', authenticate, getCategoryBreakdownData);

export default router;
