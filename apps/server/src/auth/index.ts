import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { hashPassword as _hashPassword } from 'better-auth/crypto';

import env from '@/env';
import { db } from '@/db/index';

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    useSecureCookies: env.NODE_ENV === 'production',
    ...(env.COOKIE_DOMAIN
      ? {
          crossSubDomainCookies: {
            enabled: true,
            domain: env.COOKIE_DOMAIN,
          },
        }
      : {}),
  },
  trustedOrigins: [env.CORS_ORIGIN],
});

export const hashPassword = (password: string): Promise<string> => {
  return (_hashPassword as (pw: string) => Promise<string>)(password);
};

export type AuthAPI = typeof auth.api;
export type AuthSession = Awaited<ReturnType<AuthAPI['getSession']>>;
