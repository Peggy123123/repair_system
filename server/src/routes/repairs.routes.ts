import { Router } from 'express';
import * as repairsController from '../controllers/repairs.controller.js';
import * as repliesController from '../controllers/replies.controller.js';
import { authenticateUser, authenticateAdmin, authenticateAny } from '../middleware/auth.middleware.js';
import {
  createRepairValidator,
  updateRepairValidator,
  supplementValidator,
  replyValidator,
  idParamValidator,
} from '../validators/repairs.validator.js';

const router = Router();

// User routes
// GET /api/repairs - Get user's repair requests
router.get('/', authenticateUser, repairsController.getMyRepairs);

// POST /api/repairs - Create repair request
router.post('/', authenticateUser, createRepairValidator, repairsController.createRepair);

// GET /api/repairs/:id - Get single repair request (user or admin)
router.get('/:id', authenticateAny, idParamValidator, repairsController.getRepairById);

// POST /api/repairs/:id/supplements - Add supplement
router.post('/:id/supplements', authenticateUser, supplementValidator, repairsController.addSupplement);

// GET /api/repairs/:id/replies - Get replies
router.get('/:id/replies', authenticateAny, idParamValidator, repliesController.getReplies);

// Admin routes
// POST /api/repairs/:id/replies - Create reply (admin only)
router.post('/:id/replies', authenticateAdmin, replyValidator, repliesController.createReply);

// PATCH /api/repairs/:id/replies/:replyId - Update reply (admin only)
router.patch('/:id/replies/:replyId', authenticateAdmin, replyValidator, repliesController.updateReply);

// DELETE /api/repairs/:id/replies/:replyId - Delete reply (admin only)
router.delete('/:id/replies/:replyId', authenticateAdmin, idParamValidator, repliesController.deleteReply);

// GET /api/repairs/admin/all - Get all repairs (admin only)
router.get('/admin/all', authenticateAdmin, repairsController.getAllRepairs);

// GET /api/repairs/:id/pdf - Generate PDF work order (admin only)
router.get('/:id/pdf', authenticateAdmin, idParamValidator, repairsController.generatePDF);

// PATCH /api/repairs/:id - Update repair (admin only)
router.patch('/:id', authenticateAdmin, updateRepairValidator, repairsController.updateRepair);

// DELETE /api/repairs/:id - Delete repair (admin only)
router.delete('/:id', authenticateAdmin, idParamValidator, repairsController.deleteRepair);

export default router;
