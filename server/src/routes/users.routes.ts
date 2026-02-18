import { Router } from 'express';
import * as usersController from '../controllers/users.controller.js';
import { authenticateAdmin } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import {
  updateUserValidator,
  createAdminValidator,
  updateAdminValidator,
  idParamValidator,
} from '../validators/users.validator.js';

const router = Router();

// User management (Admin access)
// GET /api/users - Get all users
router.get('/', authenticateAdmin, usersController.getUsers);

// GET /api/users/:id - Get single user
router.get('/:id', authenticateAdmin, idParamValidator, usersController.getUserById);

// GET /api/users/:id/orders - Get user's repair orders
router.get('/:id/orders', authenticateAdmin, idParamValidator, usersController.getUserOrders);

// PATCH /api/users/:id - Update user
router.patch('/:id', authenticateAdmin, updateUserValidator, usersController.updateUser);

export default router;
