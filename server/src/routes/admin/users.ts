import { Router } from 'express';
import { count, desc, ilike, or } from 'drizzle-orm';

import { db } from '../../db/index';
import { user } from '../../db/schema/index';
import { requireRole } from '../../middleware/auth';

const router = Router();

const PER_PAGE = 10;

router.get('/', requireRole(['admin']), async (_req, res) => {
  const search = String(_req.query['search'] ?? '');
  const pageNum = Math.max(1, Number(_req.query['page'] ?? 1));

  const whereClause = search
    ? or(ilike(user.name, `%${search}%`), ilike(user.email, `%${search}%`))
    : undefined;

  const countResult = await db.select({ total: count() }).from(user).where(whereClause);
  const total = countResult[0]?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const safePage = Math.min(pageNum, totalPages);

  const users = await db.query.user.findMany({
    with: { role: true },
    where: search
      ? (fields, ops) =>
          ops.or(ops.ilike(fields.name, `%${search}%`), ops.ilike(fields.email, `%${search}%`))
      : undefined,
    orderBy: [desc(user.createdAt)],
    limit: PER_PAGE,
    offset: (safePage - 1) * PER_PAGE,
  });

  res.json({ users, total, page: safePage, totalPages });
});

export default router;
