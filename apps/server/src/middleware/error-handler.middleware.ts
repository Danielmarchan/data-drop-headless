import { type Request, type Response, type NextFunction } from 'express'
import { statusCodes } from '@/constants/statusCodes';
import logger from '@/services/logging.service';

export default (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err);
  res.status(statusCodes.INTERNAL_SERVER_ERROR).json({ error: err instanceof Error ? err?.message : 'Internal server error' });
}
