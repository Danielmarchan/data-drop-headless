import { Router } from 'express';

import authRouter from './auth/auth.router';
import adminRouter from './admin/admin.router';
import viewerRouter from './viewer/viewer.router';
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
