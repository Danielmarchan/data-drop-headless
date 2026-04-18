import { Router } from 'express';

import usersRouter from '@/api/routes/admin/users.router';
import datasetsRouter from '@/api/routes/admin/datasets.router';
import uploadsRouter from '@/api/routes/admin/uploads.router';
import { requireSession } from '@/middleware/auth.middleware';

const router = Router();

router.use('/users', usersRouter);
router.use('/datasets', datasetsRouter);
router.use('/uploads', uploadsRouter);

export default router;
