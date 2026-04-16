import { z } from 'zod';

export const pageParamSchema = z.number().int().positive();
export const limitParamSchema = z.number().int().positive().max(100);
export const searchParamSchema = z.string().optional();
export const idParamSchema = z.string().uuid();
