import z from 'zod';

export const datasetDtoValidator = z.object({
  id: z.string(),
  title: z.string(),
  columns: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum(['string', 'number', 'date', 'boolean']),
      required: z.boolean(),
      position: z.number(),
    }),
  ),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DatasetDto = z.infer<typeof datasetDtoValidator>;

export const updateDatasetSchemaValidator = z.object({
  title: z.string().min(1).optional(),
});
