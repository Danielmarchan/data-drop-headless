import z from 'zod';

export const uploadDtoValidator = z.object({
  id: z.string(),
  title: z.string(),
  fileName: z.string(),
  visible: z.boolean(),
  rowCount: z.number().nullable(),
  dataset: z.object({
    id: z.string(),
    title: z.string(),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UploadDto = z.infer<typeof uploadDtoValidator>;

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
