import { Router } from 'express';
import { exportCsv, listTransactions } from '../controllers/transactionController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

console.log('[TRANSACTION ROUTES] === REGISTERING ROUTES ===');
console.log('[TRANSACTION ROUTES] 1. Registering GET / (list) FIRST');
router.get('/', authenticate, listTransactions);
console.log('[TRANSACTION ROUTES] 2. Registering GET /export/csv LAST (TEST: does being LAST make it work?)');
router.get('/export/csv', authenticate, exportCsv);

console.log('[TRANSACTION ROUTES] Final registered paths:');
router.stack.forEach((layer, idx) => {
  const route = (layer as unknown as { route?: { path?: string; methods?: Record<string, unknown> } }).route;
  if (route) {
    console.log(`  [${idx}] path="${route.path}" methods=${JSON.stringify(route.methods)}`);
  } else {
    console.log(`  [${idx}] no route property, layer.name=${(layer as unknown as { name?: string }).name}`);
  }
});
console.log('[TRANSACTION ROUTES] NOTE: /export/csv is now INDEX 1 = LAST route. If pattern holds, it should work now!');

export default router;
