import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';

import env from '@/env';
import router from '@/router';
import { statusCodes } from './constants/statusCodes';

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', router);

// Error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(statusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
});

export default app;
