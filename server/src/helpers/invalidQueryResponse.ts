import { type Response } from 'express';

export function invalidQueryResponse(res: Response, error: z.ZodError) {
  return res.status(400).json({
    error: 'Invalid query parameters',
    details: error.issues
  }); 
}
