import z from 'zod';

export const uploadDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  fileName: z.string(),
  visible: z.boolean(),
  rowCount: z.number().nullable(),
  dataset: z.object({
    id: z.string(),
    title: z.string(),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UploadDto = z.infer<typeof uploadDtoSchema>;
