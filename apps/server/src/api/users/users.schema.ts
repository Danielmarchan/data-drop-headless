import z from 'zod';
import { userDtoSchema, type UserDto, userDetailDtoSchema, type UserDetailDto } from '@data-drop/api-schema';

// Server-side DTO validator: accepts Date objects from Drizzle and serialises them to ISO strings.
export const userDtoSchemaServer = userDtoSchema.extend({
  createdAt: z.date().transform((d) => d.toISOString()),
  updatedAt: z.date().transform((d) => d.toISOString()),
});

export const userDetailDtoSchemaServer = userDetailDtoSchema.extend({
  createdAt: z.date().transform((d) => d.toISOString()),
  updatedAt: z.date().transform((d) => d.toISOString()),
  assignedDatasets: z
    .array(z.object({ dataset: z.object({ id: z.string(), title: z.string() }) }))
    .transform((rows) => rows.map((r) => r.dataset)),
});

export type { UserDto, UserDetailDto };

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string(),
  lastName: z.string().optional(),
  role: z.string(),
  assignedDatasetIds: z.array(z.string().uuid()).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.string().optional(),
  assignedDatasetIds: z.array(z.string().uuid()).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
