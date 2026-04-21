import { type Request, type Response } from 'express';

import { type AuthSession } from '@/auth';
import { db } from '@/db';
import { statusCodes } from '@/constants/statusCodes';

class AuthController {
  getMe = async (_req: Request, res: Response) => {
    const session = res.locals.session as AuthSession;

    if (!session) {
      res.status(statusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
      return;
    }

    const user = await db.query.user.findFirst({
      where: (user, { eq }) => eq(user.id, session.user.id),
      with: { role: true },
    });

    if (!user) {
      res.status(statusCodes.NOT_FOUND).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  };
}

export default new AuthController();
