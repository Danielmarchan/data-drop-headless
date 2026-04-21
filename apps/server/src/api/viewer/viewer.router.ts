import { Router } from 'express';

import { type Database } from '@/db';
import { requireViewerDatasetAccess } from '@/middleware/dataset-access.middleware';
import { createViewerDatasetsRouter } from './datasets/datasets.router';
import { createViewerUploadsRouter } from './uploads/uploads.router';
import ViewerDatasetsService from './datasets/datasets.service';
import ViewerUploadsService from './uploads/uploads.service';

export function createViewerRouter(db: Database)  {
  const datasetsService = new ViewerDatasetsService(db);
  const uploadsService = new ViewerUploadsService(db);
  const router = Router();

  router.use('/datasets', createViewerDatasetsRouter(datasetsService));
  router.use(
    '/datasets/:datasetId/uploads',
    requireViewerDatasetAccess,
    createViewerUploadsRouter(uploadsService)
  );

  return router;
}
