import { Router } from 'express';

import usersRouter from './users/users.router';
import datasetsRouter from './datasets/datasets.router';
import uploadsRouter from './uploads/uploads.router';

const router = Router();

router.use('/users', usersRouter);
router.use('/datasets', datasetsRouter);
router.use('/uploads', uploadsRouter);

export default router;
