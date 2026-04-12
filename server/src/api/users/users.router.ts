import { Router } from 'express';
import { z } from 'zod';

import { requireRole } from '@/middleware/auth.middleware';
import UsersController from './users.controller';
import { invalidQueryResponse } from '@/helpers/invalidQueryResponse';
import { ControllerError, controllerErrorValidator } from '@/types';
import { statusCodes } from '@/constants/statusCodes';
import { createUserSchemaValidator, updateUserSchemaValidator } from './users.validators';

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

router.get('/:id', requireRole(['admin']), async (req, res) => {
  const result = await UsersController.getUserById(z.string().parse(req.params['id']));

  if (!result.success) {
    return res.status(result.error.statusCode).json({ error: result.error.message });
  }

  res.json(result.data);
});

router.post('/', requireRole(['admin']), async (req, res) => {
  try {
    const input = createUserSchemaValidator.parse(req.body);
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
    const input = updateUserSchemaValidator.parse(req.body);
    const result = await UsersController.updateUser(z.string().parse(req.params['id']), input);

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
  const result = await UsersController.deleteUser(z.string().parse(req.params['id']));

  if (!result.success) {
    return res.status(result.error.statusCode).json({ error: result.error.message });
  }

  res.status(statusCodes.NO_CONTENT).send();
});

export default router;
