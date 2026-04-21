import { Router } from 'express';
import AdminDatasetsController from './datasets.controller'
import { csvUpload } from '@/middleware/csv-upload.middleware';

const router = Router();

router.get('/', AdminDatasetsController.getDatasets);
router.get('/:id', AdminDatasetsController.getDatasetById);
router.get('/:id/uploads', AdminDatasetsController.getUploadsByDatasetId);
router.post(
  '/:id/uploads',
  csvUpload,
  AdminDatasetsController.createUpload
);

export default router;
