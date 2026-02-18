import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { loginValidator, lineLoginValidator } from '../validators/auth.validator.js';

const router = Router();

// POST /api/auth/login - Frontend user login
router.post('/login', loginValidator, authController.login);

// POST /api/auth/line/callback - LINE LIFF login
router.post('/line/callback', lineLoginValidator, authController.lineLogin);

// POST /api/auth/logout - Logout (requires auth)
router.post('/logout', authenticateUser, authController.logout);

// GET /api/auth/me - Get current user
router.get('/me', authenticateUser, authController.getMe);

export default router;
