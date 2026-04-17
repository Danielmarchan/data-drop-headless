import { Router } from 'express';
import { z } from 'zod';

import { requireRole } from '@/middleware/auth.middleware';
import UploadsController from './uploads.controller';
import { invalidQueryResponse } from '@/helpers/invalidQueryResponse';
import { idParamSchema } from '@/helpers/query-params.schema';
import { statusCodes } from '@/constants/statusCodes';
import { updateUploadSchema } from './uploads.schema';

const router = Router();

router.get('/:id', async (req, res) => {
  const result = await UploadsController.getUploadById(idParamSchema.parse(req.params.id));

  if (!result.success) {
    return res.status(result.error.statusCode).json({ error: result.error.message });
  }

  res.json(result.data);
});

router.patch('/:id', async (req, res) => {
  try {
    const input = updateUploadSchema.parse(req.body);
    const result = await UploadsController.updateUpload(idParamSchema.parse(req.params.id), input);

    if (!result.success) {
      return res.status(result.error.statusCode).json({ error: result.error.message });
    }

    res.json(result.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return invalidQueryResponse(res, error);
    }
  }
});

router.delete('/:id', async (req, res) => {
  const result = await UploadsController.deleteUpload(idParamSchema.parse(req.params.id));

  if (!result.success) {
    return res.status(result.error.statusCode).json({ error: result.error.message });
  }

  res.status(statusCodes.NO_CONTENT).send();
});

export default router;
