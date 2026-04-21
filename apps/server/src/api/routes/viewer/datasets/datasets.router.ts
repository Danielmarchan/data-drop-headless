import { Router } from 'express';

import { requireViewerDatasetAccess } from '@/middleware/dataset-access.middleware';
import ViewerDatasetsController from './datasets.controller';

const router = Router();

router.get('/', ViewerDatasetsController.getAssignedDatasets);
router.get('/:datasetId', requireViewerDatasetAccess, ViewerDatasetsController.getAssignedDatasetById);

export default router;
