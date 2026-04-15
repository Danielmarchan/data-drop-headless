import { Router } from 'express';
import { toNodeHandler } from 'better-auth/node';

import { auth, type AuthSession } from '@/api/auth';
import { requireSession } from '@/middleware/auth.middleware';
import { db } from '@/db';
import { statusCodes } from '@/constants/statusCodes';

const router = Router();

// Returns the authenticated user with their DB role
router.get('/me', requireSession, async (req, res) => {
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
});

// better-auth handles all /api/auth/* routes
router.all('/*splat', toNodeHandler(auth));


export default router;
