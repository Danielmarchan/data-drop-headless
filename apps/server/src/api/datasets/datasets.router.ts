import { Router } from 'express';
import { z } from 'zod';

import { requireRole } from '@/middleware/auth.middleware';
import DatasetsController from './datasets.controller';
import UploadsController from '@/api/uploads/uploads.controller';
import { invalidQueryResponse } from '@/helpers/invalidQueryResponse';
import { idParamSchema, limitParamSchema, pageParamSchema, searchParamSchema } from '@/helpers/query-params.schema';
import { updateDatasetSchema } from './datasets.schema';
import { statusCodes } from '@/constants/statusCodes';
import { csvUpload } from '@/middleware/csv-upload.middleware';

const router = Router();

router.get('/', requireRole(['admin']), async (req, res) => {
  try {
    const search = searchParamSchema.parse(req.query.search);
    const page = pageParamSchema.parse(Number(req.query.page));
    const limit = limitParamSchema.parse(Number(req.query.limit));

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
  const result = await DatasetsController.getDatasetById(idParamSchema.parse(req.params.id));

  if (!result.success) {
    return res.status(result.error.statusCode).json({ error: result.error.message });
  }

  res.json(result.data);
});

router.get('/:id/uploads', requireRole(['admin']), async (req, res) => {
  try {
    const id = idParamSchema.parse(req.params.id);
    const search = searchParamSchema.parse(req.query.search);
    const page = pageParamSchema.parse(Number(req.query.page));
    const limit = limitParamSchema.parse(Number(req.query.limit));

    const result = await UploadsController.getUploadsByDatasetId(id, search, page, limit);

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

router.post('/:id/uploads', requireRole(['admin']), csvUpload, async (req, res) => {
  try {
    const id = idParamSchema.parse(req.params.id);

    if (!req.file) {
      return res.status(statusCodes.BAD_REQUEST).json({ error: 'No file uploaded' });
    }

    const result = await UploadsController.createUploadFromCsv(id, req.file);

    if (!result.success) {
      return res.status(result.error.statusCode).json({ error: result.error.message });
    }

    return res.status(statusCodes.CREATED).json(result.data);
  } catch (error) {
    if (error instanceof z.ZodError) return invalidQueryResponse(res, error);
    if (error instanceof Error) {
      return res.status(statusCodes.BAD_REQUEST).json({ error: error.message });
    }
  }
});

router.patch('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const input = updateDatasetSchema.parse(req.body);
    const result = await DatasetsController.updateDataset(idParamSchema.parse(req.params.id), input);

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
