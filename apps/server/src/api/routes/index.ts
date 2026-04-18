import { Router } from 'express';

import authRouter from '@/api/routes/auth';
import adminRouter from '@/api/routes/admin';
import viewerRouter from '@/api/routes/viewer';
import { requireRole, requireSession } from '@/middleware/auth.middleware';

const router = Router();

router.use('/auth', authRouter);

router.use(
  '/admin',
  requireSession,
  requireRole(['admin']),
  adminRouter
);

router.use(
  '/viewer',
  requireSession,
  requireRole(['admin', 'viewer']),
  viewerRouter
);

export default router;
