import { Router } from 'express';
import * as usersController from '../controllers/users.controller.js';
import { authenticateAdmin } from '../middleware/auth.middleware.js';
import {
  createAdminValidator,
  updateAdminValidator,
  idParamValidator,
} from '../validators/users.validator.js';

const router = Router();

// Admin management
// GET /api/admin/users - Get all admins
router.get('/', authenticateAdmin, usersController.getAdmins);

// POST /api/admin/users - Create admin
router.post('/', authenticateAdmin, createAdminValidator, usersController.createAdmin);

// PATCH /api/admin/users/:id - Update admin
router.patch('/:id', authenticateAdmin, updateAdminValidator, usersController.updateAdmin);

// DELETE /api/admin/users/:id - Delete admin
router.delete('/:id', authenticateAdmin, idParamValidator, usersController.deleteAdmin);

export default router;
