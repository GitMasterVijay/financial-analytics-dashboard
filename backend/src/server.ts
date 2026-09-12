import cors from 'cors';
import express from 'express';
import { config } from './config/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';
import healthRoutes from './routes/healthRoutes.js';

const app = express();

app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/health', healthRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${config.nodeEnv} mode`);
});

export default app;
