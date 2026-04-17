import { Router } from 'express';

import usersRouter from '@/api/admin/users/users.router';
import datasetsRouter from '@/api/admin/datasets/datasets.router';
import uploadsRouter from '@/api/admin/uploads/uploads.router';
import { requireSession } from '@/middleware/auth.middleware';

const router = Router();

router.use('/users', requireSession, usersRouter);
router.use('/datasets', requireSession, datasetsRouter);
router.use('/uploads', requireSession, uploadsRouter);

export default router;
