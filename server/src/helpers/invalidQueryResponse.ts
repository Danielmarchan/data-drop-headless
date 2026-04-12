import { type Response } from 'express';
import { z } from 'zod';
import { statusCodes } from '@/constants/statusCodes';

export function invalidQueryResponse(res: Response, error: z.ZodError) {
  return res.status(statusCodes.BAD_REQUEST).json({
    error: 'Invalid query parameters',
    details: error.issues
  }); 
}
