import { z } from 'zod';
import { type Request, type Response } from 'express';

import ViewerUploadsService from './uploads.service';
import { invalidQueryResponse } from '@/helpers/invalidQueryResponse';
import {
  idParamSchema,
  limitParamSchema,
  pageParamSchema,
  searchParamSchema,
} from '@/helpers/query-params.schema';

class ViewerUploadsController {
  getVisibleUploads = async (req: Request<{ datasetId: string }>, res: Response) => {
    try {
      const datasetId = idParamSchema.parse(req.params.datasetId);
      const search = searchParamSchema.parse(req.query.search);
      const page = pageParamSchema.parse(Number(req.query.page));
      const limit = limitParamSchema.parse(Number(req.query.limit));

      const result = await ViewerUploadsService.getVisibleUploadsByDatasetId(datasetId, search, page, limit);

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

  getUploadWithRows = async (req: Request<{ datasetId: string; id: string }>, res: Response) => {
    try {
      const datasetId = idParamSchema.parse(req.params.datasetId);
      const uploadId = idParamSchema.parse(req.params.id);

      const result = await ViewerUploadsService.getUploadWithRowsById(uploadId, datasetId);

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

export default new ViewerUploadsController();
