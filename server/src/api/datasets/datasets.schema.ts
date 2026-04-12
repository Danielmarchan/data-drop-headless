import z from 'zod';
import { datasetDtoSchema, type DatasetDto } from '@data-drop/api-schema';

// Server-side DTO validator: accepts Date objects from Drizzle and serialises them to ISO strings.
export const datasetDtoSchemaServer = datasetDtoSchema.extend({
  createdAt: z.date().transform((d) => d.toISOString()),
  updatedAt: z.date().transform((d) => d.toISOString()),
});

export type { DatasetDto };

export const updateDatasetSchema = z.object({
  title: z.string().min(1).optional(),
});
