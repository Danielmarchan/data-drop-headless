import 'dotenv/config';
import { ZodError, z } from 'zod';

const EnvSchema = z.object({
  BETTER_AUTH_SECRET:
    process.env.NODE_ENV === 'production'
      ? z.string()
      : z.string().optional(),
  BETTER_AUTH_URL: z.string().url(),
  DATABASE_URL: z.string().url(),
  SEED_DATABASE_URL: z.string().url().optional(),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT:
    process.env.NODE_ENV === 'production'
      ? z.coerce.number().optional()
      : z.coerce.number().default(3000),
  CORS_ORIGIN: z.string().url().default('http://localhost:8080'),
  COOKIE_DOMAIN: z.string().optional(),
});

export type EnvSchema = z.infer<typeof EnvSchema>;

try {
  EnvSchema.parse(process.env);
} catch (error) {
  if (error instanceof ZodError) {
    let message = 'Missing required values in .env:\n';
    error.issues.forEach((issue) => {
      message += issue.path[0] + '\n';
    });
    const e = new Error(message);
    e.stack = '';
    throw e;
  } else {
    console.error(error);
  }
}

export default EnvSchema.parse(process.env);
