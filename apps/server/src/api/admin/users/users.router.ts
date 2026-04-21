import { Router } from 'express';
import AdminUsersController from './users.controller';

const router = Router();

router.get('/', AdminUsersController.getUsers);
router.get('/:id', AdminUsersController.getUserById);
router.post('/', AdminUsersController.createUser);
router.patch('/:id', AdminUsersController.updateUser);
router.delete('/:id', AdminUsersController.deleteUser);

export default router;
