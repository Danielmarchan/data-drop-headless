import { Router } from 'express';
import { z } from 'zod';

import DatasetsController from '@/api/controllers/datasets/datasets.controller';
import { type AuthSession } from '@/auth';
import { idParamSchema } from '@/helpers/query-params.schema';
import { invalidQueryResponse } from '@/helpers/invalidQueryResponse';
import { requireViewerDatasetAccess } from '@/middleware/dataset-access.middleware';

const router = Router();

router.get('/', async (_req, res) => {
  const session = res.locals.session as AuthSession;
  const result = await DatasetsController.getDatasetsAssignedToCurrentUser(session!.user.id);

  if (!result.success) {
    return res.status(result.error.statusCode).json({ error: result.error.message });
  }

  res.json(result.data);
});

router.get('/:datasetId', requireViewerDatasetAccess, async (req, res) => {
  try {
    const datasetId = idParamSchema.parse(req.params.datasetId);
    const result = await DatasetsController.getAssignedDatasetById(datasetId);

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

export default router;
