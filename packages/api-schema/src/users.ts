import z from 'zod';

export const userDtoSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  role: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UserDto = z.infer<typeof userDtoSchema>;

export const userDetailDtoSchema = userDtoSchema.extend({
  assignedDatasets: z.array(z.object({ id: z.string(), title: z.string() })),
});

export type UserDetailDto = z.infer<typeof userDetailDtoSchema>;

export const createUserInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string(),
  lastName: z.string().optional(),
  role: z.string(),
  assignedDatasetIds: z.array(z.string()).optional(),
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const updateUserInputSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.string().optional(),
  assignedDatasetIds: z.array(z.string()).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;
