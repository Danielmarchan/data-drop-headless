import { Router } from 'express';

import datasetsRouter from './datasets.router';
import uploadsRouter from './uploads.router';
import { requireViewerDatasetAccess } from '@/middleware/dataset-access.middleware';

const router = Router();

router.use('/datasets', datasetsRouter);
router.use(
  '/datasets/:datasetId/uploads',
  requireViewerDatasetAccess,
  uploadsRouter
);

export default router;
