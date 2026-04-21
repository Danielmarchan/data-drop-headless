import { z } from 'zod';
import { type Request, type Response } from 'express';

import AdminUsersService from './users.service';
import { invalidQueryResponse } from '@/helpers/invalidQueryResponse';
import { idParamSchema, limitParamSchema, pageParamSchema, searchParamSchema } from '@/helpers/query-params.schema';
import { statusCodes } from '@/constants/statusCodes';
import { createUserSchema, updateUserSchema } from './users.schema';

class AdminUsersController {
  getUsers = async (req: Request, res: Response) => {
    try {
      const search = searchParamSchema.parse(req.query.search);
      const page = pageParamSchema.parse(Number(req.query.page));
      const limit = limitParamSchema.parse(Number(req.query.limit));

      const paginatedUsersResponse = await AdminUsersService.getPaginatedUsers(search, page, limit);

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
  };

  getUserById = async (req: Request, res: Response) => {
    const result = await AdminUsersService.getUserById(idParamSchema.parse(req.params.id));

    if (!result.success) {
      return res.status(result.error.statusCode).json({ error: result.error.message });
    }

    res.json(result.data);
  };

  createUser = async (req: Request, res: Response) => {
    try {
      const input = createUserSchema.parse(req.body);
      const result = await AdminUsersService.createUser(input);

      if (!result.success) {
        return res.status(result.error.statusCode).json({ error: result.error.message });
      }

      res.status(statusCodes.CREATED).json(result.data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return invalidQueryResponse(res, error);
      }
    }
  };

  updateUser = async (req: Request, res: Response) => {
    try {
      const input = updateUserSchema.parse(req.body);
      const result = await AdminUsersService.updateUser(idParamSchema.parse(req.params.id), input);

      if (!result.success) {
        return res.status(result.error.statusCode).json({ error: result.error.message });
      }

      res.json(result.data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return invalidQueryResponse(res, error);
      }
    }
  };

  deleteUser = async (req: Request, res: Response) => {
    const result = await AdminUsersService.deleteUser(idParamSchema.parse(req.params.id));

    if (!result.success) {
      return res.status(result.error.statusCode).json({ error: result.error.message });
    }

    res.status(statusCodes.NO_CONTENT).send();
  };
}

export default new AdminUsersController();
