import z from 'zod';

export const userDtoValidator = z.object({
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
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserDto = z.infer<typeof userDtoValidator>;
