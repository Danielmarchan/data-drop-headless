import { Router } from 'express';
import usersRouter from './users.js';
import { requireRole } from '../../middleware/auth.js';
import { type SelectUser } from '../../db/schema/index.js';
import { type SelectRole } from '../../db/schema/index.js';

const router = Router();

// Returns the authenticated admin user with their DB role
router.get('/me', requireRole(['admin']), (req, res) => {
  const dbUser = res.locals['dbUser'] as SelectUser & { role: SelectRole | null };
  res.json({ user: dbUser });
});

router.use('/users', usersRouter);

export default router;
