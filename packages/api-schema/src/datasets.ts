import z from 'zod';

export const datasetColumnSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['string', 'number', 'date', 'boolean']),
  required: z.boolean(),
  position: z.number(),
});

export type DatasetColumn = z.infer<typeof datasetColumnSchema>;

export const datasetDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  columns: z.array(datasetColumnSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type DatasetDto = z.infer<typeof datasetDtoSchema>;

export const adminListDatasetSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type AdminListDataset = z.infer<typeof adminListDatasetSchema>;
