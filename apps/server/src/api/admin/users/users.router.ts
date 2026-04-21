import { Router } from 'express';

import type AdminUsersService from './users.service';
import AdminUsersController from './users.controller';

export function createAdminUsersRouter(usersService: AdminUsersService) {
  const controller = new AdminUsersController(usersService);
  const router = Router();

  router.get('/', controller.getUsers);
  router.get('/:id', controller.getUserById);
  router.post('/', controller.createUser);
  router.patch('/:id', controller.updateUser);
  router.delete('/:id', controller.deleteUser);

  return router;
}
