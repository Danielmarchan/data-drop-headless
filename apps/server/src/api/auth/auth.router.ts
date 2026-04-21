import { Router } from 'express';
import { toNodeHandler } from 'better-auth/node';

import { auth } from '@/auth';
import { type Database } from '@/db';
import { requireSession } from '@/middleware/auth.middleware';
import AuthController from './auth.controller';

export function createAuthRouter(db: Database) {
  const controller = new AuthController(db);
  const router = Router();

  router.get('/me', requireSession, controller.getMe);

  // better-auth handles all /api/auth/* routes
  router.all('/*splat', toNodeHandler(auth));

  return router;
}
