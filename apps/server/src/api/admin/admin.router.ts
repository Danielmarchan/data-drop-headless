import { Router } from 'express';

import { type Database } from '@/db';
import { createAdminUsersRouter } from './users/users.router';
import { createAdminDatasetsRouter } from './datasets/datasets.router';
import { createAdminUploadsRouter } from './uploads/uploads.router';
import AdminUsersService from './users/users.service';
import AdminDatasetsService from './datasets/datasets.service';
import AdminUploadsService from './uploads/uploads.service';

export function createAdminRouter(db: Database) {
  const usersService = new AdminUsersService(db);
  const datasetsService = new AdminDatasetsService(db);
  const uploadsService = new AdminUploadsService(db);
  const router = Router();

  router.use('/users', createAdminUsersRouter(usersService));
  router.use('/datasets', createAdminDatasetsRouter(datasetsService, uploadsService));
  router.use('/uploads', createAdminUploadsRouter(uploadsService));

  return router;
}
