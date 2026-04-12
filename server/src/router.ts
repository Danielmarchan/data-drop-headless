import { Router } from 'express';

import authRouter from '@/api/auth/auth.router';
import usersRouter from '@/api/users/users.router';
import { requireSession } from './middleware/auth.middleware';

const router = Router();

router.use('/auth', authRouter);

router.use('/users', requireSession, usersRouter);

export default router;
