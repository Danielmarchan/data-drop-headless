import { z } from 'zod';

const EnvSchema = z.object({
  API_URL: z.string().url().default('http://localhost:3000'),
});

export default EnvSchema.parse(import.meta.env);
