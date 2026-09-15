import cors from 'cors';
import express, { Router } from 'express';
import { connectDB } from './config/db.js';
import { config } from './config/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';
import { authenticate } from './middleware/authMiddleware.js';
import { exportCsv } from './controllers/transactionController.js';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';

const app = express();

app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DIRECT ROUTE TEST: Bypass Router entirely for CSV export
app.get('/api/transactions/export/csv', authenticate, exportCsv);
console.log('[SERVER] Registered DIRECT route: GET /api/transactions/export/csv');

// FRESH TEST ROUTER to compare pattern
const testRouter = Router();
testRouter.get('/a', (_req, res) => res.json({ ok: true, route: '/a' }));
testRouter.get('/b/c', (_req, res) => res.json({ ok: true, route: '/b/c (multi-seg)' }));
testRouter.get('/', (_req, res) => res.json({ ok: true, route: '/' }));
app.use('/api/test-router', testRouter);
console.log('[SERVER] Mounted /api/test-router with 3 routes');

app.use('/api/health', healthRoutes);
// SWAPPED ORDER: Move dashboard LAST (was 3rd, now 4th). Move transactions BEFORE dashboard (was 4th, now 3rd).
// If only LAST router's routes work, dashboard will break and transactions will work.
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
console.log('[SERVER] Mount order: health → auth → transactions → dashboard');

app.use(notFoundHandler);
app.use(errorHandler);

function listRegisteredRoutes(): void {
  const routes: string[] = [];
  function extract(stack: unknown[], prefix: string): void {
    stack.forEach((layer: unknown) => {
      const l = layer as { route?: { path?: string; stack?: unknown[]; methods?: Record<string, boolean> }; name?: string; handle?: { stack?: unknown[] }; regexp?: { fast_slash?: boolean } };
      if (l.route && typeof l.route.path === 'string') {
        const methods = Object.keys(l.route.methods ?? {}).join(',').toUpperCase();
        routes.push(`${methods} ${prefix}${l.route.path}`);
      } else if (l.name === 'router' && l.handle?.stack) {
        let mountPath = prefix;
        const reg = (layer as { regexp?: { toString?: () => string } }).regexp?.toString?.();
        if (reg) {
          const match = reg.match(/\/api\/[a-z]+/i);
          if (match) mountPath = match[0];
        }
        extract(l.handle.stack, mountPath);
      } else if (l.regexp?.fast_slash === true && (layer as { handle?: { stack?: unknown[] } }).handle?.stack) {
        extract((layer as { handle: { stack: unknown[] } }).handle.stack, prefix);
      }
    });
  }
  const router = (app as unknown as { _router?: { stack?: unknown[] } })._router;
  if (router?.stack) {
    extract(router.stack, '');
  }
  console.log('\n=== REGISTERED ROUTES ===');
  routes.forEach((r) => console.log('  -', r));
  console.log('=========================\n');
}

const PORT = config.port;

async function startServer(): Promise<void> {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${config.nodeEnv} mode`);
    listRegisteredRoutes();
  });
}

void startServer();

export default app;
