import { Router } from 'express';
import { z } from 'zod';

import { requireRole } from '@/middleware/auth.middleware';
import UploadsController from './uploads.controller';
import { invalidQueryResponse } from '@/helpers/invalidQueryResponse';
import { statusCodes } from '@/constants/statusCodes';
import { createUploadSchemaValidator, updateUploadSchemaValidator } from './uploads.validators';

const router = Router();

router.get('/', requireRole(['admin']), async (req, res) => {
  try {
    const search = z.string().optional().parse(req.query['search']);
    const page = z.number().int().positive().parse(Number(req.query['page']));
    const limit = z.number().int().positive().parse(Number(req.query['limit']));

    const result = await UploadsController.getPaginatedUploads(search, page, limit);

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
  const result = await UploadsController.getUploadById(z.string().parse(req.params['id']));

  if (!result.success) {
    return res.status(result.error.statusCode).json({ error: result.error.message });
  }

  res.json(result.data);
});

router.post('/', requireRole(['admin']), async (req, res) => {
  try {
    const input = createUploadSchemaValidator.parse(req.body);
    const result = await UploadsController.createUpload(input);

    if (!result.success) {
      return res.status(result.error.statusCode).json({ error: result.error.message });
    }

    res.status(statusCodes.CREATED).json(result.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return invalidQueryResponse(res, error);
    }
  }
});

router.patch('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const input = updateUploadSchemaValidator.parse(req.body);
    const result = await UploadsController.updateUpload(z.string().parse(req.params['id']), input);

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

router.delete('/:id', requireRole(['admin']), async (req, res) => {
  const result = await UploadsController.deleteUpload(z.string().parse(req.params['id']));

  if (!result.success) {
    return res.status(result.error.statusCode).json({ error: result.error.message });
  }

  res.status(statusCodes.NO_CONTENT).send();
});

export default router;
