import { Router } from 'express';
import { toNodeHandler } from 'better-auth/node';

import { auth } from '@/auth';
import { requireSession } from '@/middleware/auth.middleware';
import AuthController from './auth.controller';

const router = Router();

router.get('/me', requireSession, AuthController.getMe);

// better-auth handles all /api/auth/* routes
router.all('/*splat', toNodeHandler(auth));

export default router;
