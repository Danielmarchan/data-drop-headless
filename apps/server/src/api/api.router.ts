import { Router } from 'express';

import { type Database } from '@/db';
import { requireRole, requireSession } from '@/middleware/auth.middleware';
import { createAuthRouter } from './auth/auth.router';
import { createAdminRouter } from './admin/admin.router';
import { createViewerRouter } from './viewer/viewer.router';

export function createApiRouter(db: Database)  {
  const router = Router();

  router.use('/auth', createAuthRouter(db));

  router.use(
    '/admin',
    requireSession,
    requireRole(['admin']),
    createAdminRouter(db)
  );

  router.use(
    '/viewer',
    requireSession,
    requireRole(['admin', 'viewer']),
    createViewerRouter(db)
  );

  return router;
}
