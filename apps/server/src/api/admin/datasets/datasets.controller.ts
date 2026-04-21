import { z } from 'zod';
import { type Request, type Response } from 'express';

import type AdminDatasetsService from './datasets.service';
import type AdminUploadsService from '../uploads/uploads.service';
import { invalidQueryResponse } from '@/helpers/invalidQueryResponse';
import { idParamSchema, limitParamSchema, pageParamSchema, searchParamSchema } from '@/helpers/query-params.schema';
import { statusCodes } from '@/constants/statusCodes';

class AdminDatasetsController {
  constructor(
    private datasetsService: AdminDatasetsService,
    private uploadsService: AdminUploadsService,
  ) {}

  getDatasets = async (req: Request, res: Response) => {
    try {
      const search = searchParamSchema.parse(req.query.search);
      const page = pageParamSchema.parse(Number(req.query.page));
      const limit = limitParamSchema.parse(Number(req.query.limit));

      const result = await this.datasetsService.getPaginatedDatasets(search, page, limit);

      if (!result.success) {
        return res.status(result.error.statusCode).json({ error: result.error.message });
      }

      res.json(result.data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return invalidQueryResponse(res, error);
      }
    }
  }

  getDatasetById = async (req: Request, res: Response) => {
    const result = await this.datasetsService.getDatasetById(idParamSchema.parse(req.params.id));

    if (!result.success) {
      return res.status(result.error.statusCode).json({ error: result.error.message });
    }

    res.json(result.data);
  };

  getUploadsByDatasetId = async (req: Request, res: Response) => {
    try {
      const id = idParamSchema.parse(req.params.id);
      const search = searchParamSchema.parse(req.query.search);
      const page = pageParamSchema.parse(Number(req.query.page));
      const limit = limitParamSchema.parse(Number(req.query.limit));

      const result = await this.uploadsService.getUploadsByDatasetId(id, search, page, limit);

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

  createUpload = async (req: Request, res: Response) => { // Depends on csvUpload middleware
    try {
      const id = idParamSchema.parse(req.params.id);

      if (!req.file) {
        return res.status(statusCodes.BAD_REQUEST).json({ error: 'No file uploaded' });
      }

      const result = await this.uploadsService.createUploadFromCsv(id, req.file);

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
  }
}

export default AdminDatasetsController;
