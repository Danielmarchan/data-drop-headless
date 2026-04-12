import { Router } from 'express';

import authRouter from '@/api/auth/auth.router';
import usersRouter from '@/api/users/users.router';
import datasetsRouter from '@/api/datasets/datasets.router';
import uploadsRouter from '@/api/uploads/uploads.router';
import { requireSession } from '@/middleware/auth.middleware';

const router = Router();

router.use('/auth', authRouter);

router.use('/users', requireSession, usersRouter);
router.use('/datasets', requireSession, datasetsRouter);
router.use('/uploads', requireSession, uploadsRouter);

export default router;
