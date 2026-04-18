import { Router, type Request } from 'express';
import { z } from 'zod';

import UploadsController from '@/api/controllers/uploads/uploads.controller';
import { invalidQueryResponse } from '@/helpers/invalidQueryResponse';
import {
  idParamSchema,
  limitParamSchema,
  pageParamSchema,
  searchParamSchema,
} from '@/helpers/query-params.schema';

const router = Router({ mergeParams: true });

router.get('/', async (req: Request<{ datasetId: string }>, res) => {
  try {
    const datasetId = idParamSchema.parse(req.params.datasetId);
    const search = searchParamSchema.parse(req.query.search);
    const page = pageParamSchema.parse(Number(req.query.page));
    const limit = limitParamSchema.parse(Number(req.query.limit));

    const result = await UploadsController.getVisibleUploadsByDatasetId(datasetId, search, page, limit);

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

router.get('/:id', async (req: Request<{ datasetId: string; id: string }>, res) => {
  try {
    const datasetId = idParamSchema.parse(req.params.datasetId);
    const uploadId = idParamSchema.parse(req.params.id);

    const result = await UploadsController.getUploadWithRowsById(uploadId, datasetId);

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
