import { Router } from 'express';

import { csvUpload } from '@/middleware/csv-upload.middleware';
import AdminDatasetsController from './datasets.controller';
import type AdminDatasetsService from './datasets.service';
import type AdminUploadsService from '../uploads/uploads.service';

export function createAdminDatasetsRouter(
  datasetsService: AdminDatasetsService,
  uploadsService: AdminUploadsService,
) {
  const controller = new AdminDatasetsController(datasetsService, uploadsService);
  const router = Router();

  router.get('/', controller.getDatasets);
  router.get('/:id', controller.getDatasetById);
  router.get('/:id/uploads', controller.getUploadsByDatasetId);
  router.post(
    '/:id/uploads',
    csvUpload,
    controller.createUpload
  );

  return router;
}
