import z from 'zod';
import { uploadDtoSchema, type UploadDto } from '@data-drop/api-schema';

// Server-side DTO validator: accepts Date objects from Drizzle and serialises them to ISO strings.
export const uploadDtoSchemaServer = uploadDtoSchema.extend({
  createdAt: z.date().transform((d) => d.toISOString()),
  updatedAt: z.date().transform((d) => d.toISOString()),
});

export type { UploadDto };

export const updateUploadSchema = z.object({
  title: z.string().min(1).optional(),
  visible: z.boolean().optional(),
});

export type UpdateUploadInput = z.infer<typeof updateUploadSchema>;
