import { z } from 'zod';
import { type Request, type Response } from 'express';

import type ViewerDatasetsService from './datasets.service';
import { type AuthSession } from '@/auth';
import { idParamSchema } from '@/helpers/query-params.schema';
import { invalidQueryResponse } from '@/helpers/invalidQueryResponse';

class ViewerDatasetsController {
  constructor(
    private datasetsService: ViewerDatasetsService,
  ) {}

  getAssignedDatasets = async (_req: Request, res: Response) => {
    const session = res.locals.session as AuthSession;
    const result = await this.datasetsService.getDatasetsAssignedToCurrentUser(session!.user.id);

    if (!result.success) {
      return res.status(result.error.statusCode).json({ error: result.error.message });
    }

    res.json(result.data);
  };

  getAssignedDatasetById = async (req: Request, res: Response) => {
    try {
      const datasetId = idParamSchema.parse(req.params.datasetId);
      const result = await this.datasetsService.getAssignedDatasetById(datasetId);

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
}

export default ViewerDatasetsController;
