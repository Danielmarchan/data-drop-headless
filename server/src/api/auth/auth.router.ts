import { Router } from 'express';
import { toNodeHandler } from 'better-auth/node';

import { auth } from '@/api/auth';
import { requireSession } from '@/middleware/auth.middleware';
import { db } from '@/db';

const router = Router();

// Returns the authenticated user with their DB role
router.get('/me', requireSession, async (req, res) => {
  const session = res.locals['session'];
  const user = await db.query.user.findFirst({
    where: (user, { eq }) => eq(user.id, session.user.id),
    with: { role: true },
  });

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }  
  res.json({ user });
});

// better-auth handles all /api/auth/* routes
router.all('/*splat', toNodeHandler(auth));


export default router;
