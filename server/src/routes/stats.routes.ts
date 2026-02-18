import { Router } from 'express';
import * as statsController from '../controllers/stats.controller.js';
import { authenticateAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/stats/summary - Get dashboard summary
router.get('/summary', authenticateAdmin, statsController.getSummary);

export default router;
