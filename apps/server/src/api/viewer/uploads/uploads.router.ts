import { Router } from 'express';

import ViewerUploadsController from './uploads.controller';

const router = Router({ mergeParams: true });

router.get('/', ViewerUploadsController.getVisibleUploads);
router.get('/:id', ViewerUploadsController.getUploadWithRows);

export default router;
