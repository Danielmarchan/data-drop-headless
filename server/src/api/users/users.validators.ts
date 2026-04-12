import z from 'zod';
import { userDtoSchema, type UserDto } from '@data-drop/api-schema';

// Server-side DTO validator: accepts Date objects from Drizzle and serialises them to ISO strings.
export const userDtoValidator = userDtoSchema.extend({
  createdAt: z.date().transform((d) => d.toISOString()),
  updatedAt: z.date().transform((d) => d.toISOString()),
});

export type { UserDto };

export const createUserSchemaValidator = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  roleId: z.string().uuid().optional(),
});

export const updateUserSchemaValidator = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  roleId: z.string().uuid().optional(),
});
