import { Router } from 'express';
import { z } from 'zod';

import { requireRole } from '@/middleware/auth.middleware';
import UsersController from './users.controller';
import { invalidQueryResponse } from '@/helpers/invalidQueryResponse';
import { statusCodes } from '@/constants/statusCodes';
import { createUserSchema, updateUserSchema } from './users.schema';

const router = Router();

router.get('/', requireRole(['admin']), async (req, res) => {
  try {
    const search = z.string().optional().parse(req.query.search);
    const page = z.number().int().positive().parse(Number(req.query.page));
    const limit = z.number().int().positive().max(100).parse(Number(req.query.limit));

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

router.get('/:id', requireRole(['admin']), async (req, res) => {
  const result = await UsersController.getUserById(z.string().parse(req.params.id));

  if (!result.success) {
    return res.status(result.error.statusCode).json({ error: result.error.message });
  }

  res.json(result.data);
});

router.post('/', requireRole(['admin']), async (req, res) => {
  try {
    const input = createUserSchema.parse(req.body);
    const result = await UsersController.createUser(input);

    if (!result.success) {
      return res.status(result.error.statusCode).json({ error: result.error.message });
    }

    res.status(statusCodes.CREATED).json(result.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return invalidQueryResponse(res, error);
    }
  }
});

router.patch('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const input = updateUserSchema.parse(req.body);
    const result = await UsersController.updateUser(z.string().parse(req.params.id), input);

    if (!result.success) {
      return res.status(result.error.statusCode).json({ error: result.error.message });
    }

    res.json(result.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return invalidQueryResponse(res, error);
    }
  }
});

router.delete('/:id', requireRole(['admin']), async (req, res) => {
  const result = await UsersController.deleteUser(z.string().parse(req.params.id));

  if (!result.success) {
    return res.status(result.error.statusCode).json({ error: result.error.message });
  }

  res.status(statusCodes.NO_CONTENT).send();
});

export default router;
