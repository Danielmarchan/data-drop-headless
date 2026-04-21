import { Router } from 'express';

import { requireViewerDatasetAccess } from '@/middleware/dataset-access.middleware';
import ViewerDatasetsController from './datasets.controller';
import type ViewerDatasetsService from './datasets.service';

export function createViewerDatasetsRouter(datasetsService: ViewerDatasetsService) {
  const controller = new ViewerDatasetsController(datasetsService);
  const router = Router();

  router.get('/', controller.getAssignedDatasets);
  router.get('/:datasetId', requireViewerDatasetAccess, controller.getAssignedDatasetById);

  return router;
}
