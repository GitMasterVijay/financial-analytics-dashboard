import cors from 'cors';
import express from 'express';
import { connectDB } from './config/db.js';
import { config } from './config/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';

const app = express();

app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/transactions', transactionRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = config.port;

async function startServer(): Promise<void> {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${config.nodeEnv} mode`);
  });
}

void startServer();

export default app;
