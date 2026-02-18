import { Router } from 'express';
import authRoutes from './auth.routes.js';
import adminAuthRoutes from './admin.auth.routes.js';
import repairsRoutes from './repairs.routes.js';
import usersRoutes from './users.routes.js';
import adminUsersRoutes from './admin.users.routes.js';
import statsRoutes from './stats.routes.js';

const router = Router();

// Auth routes
router.use('/auth', authRoutes);
router.use('/admin/auth', adminAuthRoutes);

// Resource routes
router.use('/repairs', repairsRoutes);
router.use('/users', usersRoutes);
router.use('/admin/users', adminUsersRoutes);
router.use('/stats', statsRoutes);

export default router;
