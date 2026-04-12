import { Router } from 'express';
import { count, desc, ilike, or } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db/index';
import { user } from '@/db/schema/index';
import { requireRole } from '@/middleware/auth.middleware';
import UsersController from './users.controller';
import { invalidQueryResponse } from '@/helpers/invalidQueryResponse';

const router = Router();


router.get('/', requireRole(['admin']), async (_req, res) => {
  try {
    const search = z.string().optional().parse(_req.query['search']);
    const page = z.number().int().positive().parse(Number(_req.query['page']));
    const limit = z.number().int().positive().parse(Number(_req.query['limit']));

    const paginatedUsersResponse = await UsersController.getPaginatedUsers(search, page, limit);

    if (!paginatedUsersResponse.success) {
      return res.status(paginatedUsersResponse.error.statusCode).json({
        error: paginatedUsersResponse.error.message
      });
    }

    res.json(paginatedUsersResponse.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return invalidQueryResponse(res, error);
    }
  }
});

export default router;
