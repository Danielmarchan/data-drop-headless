import { Router } from 'express';
import { toNodeHandler } from 'better-auth/node';

import { auth } from '../auth/index';
import adminRouter from './admin/index';

const router = Router();

// better-auth handles all /api/auth/* routes
router.all('/auth/*splat', toNodeHandler(auth));

// Admin API
router.use('/admin', adminRouter);

export default router;
