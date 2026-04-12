import { Router } from 'express';
import { z } from 'zod';

import { requireRole } from '@/middleware/auth.middleware';
import DatasetsController from './datasets.controller';
import { invalidQueryResponse } from '@/helpers/invalidQueryResponse';
import { updateDatasetSchema } from './datasets.schema';

const router = Router();

router.get('/', requireRole(['admin']), async (req, res) => {
  try {
    const search = z.string().optional().parse(req.query['search']);
    const page = z.number().int().positive().parse(Number(req.query['page']));
    const limit = z.number().int().positive().parse(Number(req.query['limit']));

    const result = await DatasetsController.getPaginatedDatasets(search, page, limit);

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

router.get('/:id', requireRole(['admin']), async (req, res) => {
  const result = await DatasetsController.getDatasetById(z.string().parse(req.params['id']));

  if (!result.success) {
    return res.status(result.error.statusCode).json({ error: result.error.message });
  }

  res.json(result.data);
});

router.patch('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const input = updateDatasetSchema.parse(req.body);
    const result = await DatasetsController.updateDataset(z.string().parse(req.params['id']), input);

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
