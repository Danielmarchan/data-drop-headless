import { Router } from 'express';
import { z } from 'zod';

import { requireRole } from '@/middleware/auth.middleware';
import UsersController from './users.controller';
import { invalidQueryResponse } from '@/helpers/invalidQueryResponse';
import { idParamSchema, limitParamSchema, pageParamSchema, searchParamSchema } from '@/helpers/query-params.schema';
import { statusCodes } from '@/constants/statusCodes';
import { createUserSchema, updateUserSchema } from './users.schema';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const search = searchParamSchema.parse(req.query.search);
    const page = pageParamSchema.parse(Number(req.query.page));
    const limit = limitParamSchema.parse(Number(req.query.limit));

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

router.get('/:id', async (req, res) => {
  const result = await UsersController.getUserById(idParamSchema.parse(req.params.id));

  if (!result.success) {
    return res.status(result.error.statusCode).json({ error: result.error.message });
  }

  res.json(result.data);
});

router.post('/', async (req, res) => {
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

router.patch('/:id', async (req, res) => {
  try {
    const input = updateUserSchema.parse(req.body);
    const result = await UsersController.updateUser(idParamSchema.parse(req.params.id), input);

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

router.delete('/:id', async (req, res) => {
  const result = await UsersController.deleteUser(idParamSchema.parse(req.params.id));

  if (!result.success) {
    return res.status(result.error.statusCode).json({ error: result.error.message });
  }

  res.status(statusCodes.NO_CONTENT).send();
});

export default router;
