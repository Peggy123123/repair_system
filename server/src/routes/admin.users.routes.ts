import { Router } from 'express';
import * as usersController from '../controllers/users.controller.js';
import { authenticateAdmin } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import {
  createAdminValidator,
  updateAdminValidator,
  idParamValidator,
} from '../validators/users.validator.js';

const router = Router();

// Admin management (Super Admin access)
// GET /api/admin/users - Get all admins
router.get('/', authenticateAdmin, requireRole('super_admin'), usersController.getAdmins);

// POST /api/admin/users - Create admin
router.post('/', authenticateAdmin, requireRole('super_admin'), createAdminValidator, usersController.createAdmin);

// PATCH /api/admin/users/:id - Update admin
router.patch('/:id', authenticateAdmin, requireRole('super_admin'), updateAdminValidator, usersController.updateAdmin);

// DELETE /api/admin/users/:id - Delete admin
router.delete('/:id', authenticateAdmin, requireRole('super_admin'), idParamValidator, usersController.deleteAdmin);

export default router;
