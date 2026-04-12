import { Router } from 'express';
import { z } from 'zod';

import { requireRole } from '@/middleware/auth.middleware';
import UsersController from './users.controller';
import { invalidQueryResponse } from '@/helpers/invalidQueryResponse';
import { ControllerError, controllerErrorValidator } from '@/types';

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
    } else if (controllerErrorValidator.safeParse(error).success) {
      const controllerError = error as ControllerError;
      return res.status(controllerError.statusCode).json({ error: controllerError.message });
    }
  }
});

export default router;
