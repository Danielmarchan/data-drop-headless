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
