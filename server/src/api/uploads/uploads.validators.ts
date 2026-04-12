import z from 'zod';
import { uploadDtoSchema, type UploadDto } from '@data-drop/api-schema';

// Server-side DTO validator: accepts Date objects from Drizzle and serialises them to ISO strings.
export const uploadDtoValidator = uploadDtoSchema.extend({
  createdAt: z.date().transform((d) => d.toISOString()),
  updatedAt: z.date().transform((d) => d.toISOString()),
});

export type { UploadDto };

export const createUploadSchemaValidator = z.object({
  title: z.string().min(1),
  fileName: z.string().min(1),
  datasetId: z.string().uuid(),
  visible: z.boolean().optional(),
  rowCount: z.number().int().nonnegative().optional(),
});

export const updateUploadSchemaValidator = z.object({
  title: z.string().min(1).optional(),
  visible: z.boolean().optional(),
  rowCount: z.number().int().nonnegative().optional(),
});
