import { type Request, type Response, type NextFunction } from 'express'
import { statusCodes } from '@/constants/statusCodes';

export default (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(statusCodes.INTERNAL_SERVER_ERROR).json({ error: err instanceof Error ? err?.message : 'Internal server error' });
}
