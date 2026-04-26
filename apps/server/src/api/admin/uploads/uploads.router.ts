import { Router } from 'express';

import AdminUploadsController from './uploads.controller';
import type AdminUploadsService from './uploads.service';

export function createAdminUploadsRouter(uploadsService: AdminUploadsService) {
  const controller = new AdminUploadsController(uploadsService);
  const router = Router();

  router.get('/:id', controller.getUploadById);
  router.patch('/:id', controller.updateUpload);
  router.delete('/:id', controller.deleteUpload);

  return router;
}
