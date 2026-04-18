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

export const viewerUploadListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
});

export type ViewerUploadListItem = z.infer<typeof viewerUploadListItemSchema>;

export const uploadRowDtoSchema = z.object({
  rowIndex: z.number().int().nonnegative(),
  data: z.record(z.string(), z.unknown()),
});

export type UploadRowDto = z.infer<typeof uploadRowDtoSchema>;

export const viewerUploadDetailDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  rows: z.array(uploadRowDtoSchema),
});

export type ViewerUploadDetailDto = z.infer<typeof viewerUploadDetailDtoSchema>;
