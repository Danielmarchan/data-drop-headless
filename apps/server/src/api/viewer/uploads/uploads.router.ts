import { Router } from 'express';

import ViewerUploadsController from './uploads.controller';
import type ViewerUploadsService from './uploads.service';

export function createViewerUploadsRouter(uploadsService: ViewerUploadsService) {
  const controller = new ViewerUploadsController(uploadsService);
  const router = Router({ mergeParams: true });

  router.get('/', controller.getVisibleUploads);
  router.get('/:id', controller.getUploadWithRows);

  return router;
}
