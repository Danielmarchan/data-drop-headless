import { z } from 'zod';
import { type Request, type Response } from 'express';

import type AdminUploadsService from './uploads.service';
import { invalidQueryResponse } from '@/helpers/invalidQueryResponse';
import { idParamSchema } from '@/helpers/query-params.schema';
import { statusCodes } from '@/constants/statusCodes';
import { updateUploadInputSchema } from '@data-drop/api-schema';

class AdminUploadsController {
  constructor(
    private uploadsService: AdminUploadsService,
  ) {}

  getUploadById = async (req: Request, res: Response) => {
    const result = await this.uploadsService.getUploadById(idParamSchema.parse(req.params.id));

    if (!result.success) {
      return res.status(result.error.statusCode).json({ error: result.error.message });
    }

    res.json(result.data);
  };

  updateUpload = async (req: Request, res: Response) => {
    try {
      const input = updateUploadInputSchema.parse(req.body);
      const result = await this.uploadsService.updateUpload(idParamSchema.parse(req.params.id), input);

      if (!result.success) {
        return res.status(result.error.statusCode).json({ error: result.error.message });
      }

      res.json(result.data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return invalidQueryResponse(res, error);
      }
    }
  };

  deleteUpload = async (req: Request, res: Response) => {
    const result = await this.uploadsService.deleteUpload(idParamSchema.parse(req.params.id));

    if (!result.success) {
      return res.status(result.error.statusCode).json({ error: result.error.message });
    }

    res.status(statusCodes.NO_CONTENT).send();
  };
}

export default AdminUploadsController;
