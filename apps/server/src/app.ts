import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import actuator from 'express-actuator';

import env from '@/env';
import { createApiRouter } from '@/api/api.router';
import { db } from '@/db';
import docsRouter from '@/docs/docs.router';
import { requireSession } from '@/middleware/auth.middleware';
import { loggerMiddleware } from './services/logging.service';
import errorHandlerMiddleware from './middleware/error-handler.middleware';

const app = express();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500 // limit each IP to 100 requests per windowMs
});

// Security Middleware
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
); // CORS headers
app.use(helmet()); // HTTP headers security
app.use(hpp()); // Parameter Pollution attacks
if (env.NODE_ENV !== 'development') app.use(limiter); // Rate limiting (DDoS protection)

// Performance Middleware
app.use(compression()); // Gzip compression

// Observability Middleware
app.use(loggerMiddleware); // Request logging
app.use(actuator()); // Application health monitoring

// Request Parsing Middleware
app.use(express.json());

// Endpoints
app.use('/api', createApiRouter(db));
app.use('/docs', requireSession, docsRouter);

// Error handler
app.use(errorHandlerMiddleware);

export default app;
