import { Router } from 'express';
import * as adminAuthController from '../controllers/admin.auth.controller.js';
import { authenticateAdmin } from '../middleware/auth.middleware.js';
import { loginValidator } from '../validators/auth.validator.js';

const router = Router();

// POST /api/admin/auth/login - Admin login
router.post('/login', loginValidator, adminAuthController.login);

// POST /api/admin/auth/logout - Admin logout
router.post('/logout', authenticateAdmin, adminAuthController.logout);

// GET /api/admin/auth/me - Get current admin
router.get('/me', authenticateAdmin, adminAuthController.getMe);

// PUT /api/admin/auth/password - Change admin password
router.put('/password', authenticateAdmin, adminAuthController.changePassword);

export default router;
