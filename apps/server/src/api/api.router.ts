import { Router } from 'express';

import authRouter from '@/api/auth/auth.router';
import adminRouter from '@/api/admin/admin.router';
import { requireRole, requireSession } from '@/middleware/auth.middleware';

const router = Router();

router.use('/auth', authRouter);

router.use(
  '/admin',
  requireSession,
  requireRole(['admin']),
  adminRouter
);

export default router;
