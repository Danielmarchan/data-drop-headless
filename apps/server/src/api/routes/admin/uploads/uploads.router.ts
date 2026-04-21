import { Router } from 'express';
import AdminUploadsController from './uploads.controller';

const router = Router();

router.get('/:id', AdminUploadsController.getUploadById);
router.patch('/:id', AdminUploadsController.updateUpload);
router.delete('/:id', AdminUploadsController.deleteUpload);

export default router;
