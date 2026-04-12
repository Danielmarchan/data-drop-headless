import { type Request, type Response, type NextFunction } from 'express';
import { fromNodeHeaders } from 'better-auth/node';

import { auth } from '@/api/auth';
import { db } from '@/db';

export async function requireSession(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  res.locals['session'] = session;
  next();
}

export function requireRole(allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const session = res.locals['session'];

    const user = await db.query.user.findFirst({
      where: (user, { eq }) => eq(user.id, session.user.id),
      with: { role: true },
    });

    if (!allowedRoles.includes(user?.role?.name ?? '')) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    res.locals['user'] = user;
    next();
  };
}
