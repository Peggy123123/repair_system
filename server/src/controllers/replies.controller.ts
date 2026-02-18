import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Reply } from '../models/Reply.js';
import { RepairOrder } from '../models/RepairOrder.js';
import { Admin } from '../models/Admin.js';
import { sendSuccess, sendError, sendValidationError } from '../utils/response.utils.js';

// Get replies for a repair order
export const getReplies = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendValidationError(
        res,
        errors.array().map((e) => ({ field: e.type === 'field' ? e.path : 'unknown', message: e.msg }))
      );
      return;
    }

    if (!req.user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    const repair = await RepairOrder.findById(req.params.id);

    if (!repair) {
      sendError(res, 'Repair order not found', 404);
      return;
    }

    // Users can only view replies for their own requests
    if (req.user.type === 'user' && repair.userId.toString() !== req.user.id) {
      sendError(res, 'Not authorized', 403);
      return;
    }

    const replies = await Reply.find({ repairOrderId: req.params.id })
      .populate('adminId', 'displayName avatarUrl')
      .sort({ createdAt: 1 })
      .lean();

    const formattedReplies = replies.map((r) => {
      const admin = r.adminId as unknown as { _id: string; displayName: string; avatarUrl: string } | null;
      const createdAt = r.createdAt || new Date();
      const updatedAt = r.updatedAt || createdAt;
      return {
        id: r._id.toString(),
        repairOrderId: r.repairOrderId.toString(),
        adminId: admin?._id?.toString() || '',
        adminName: admin?.displayName || 'Admin',
        adminAvatar: admin?.avatarUrl || '',
        content: r.content,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
      };
    });

    sendSuccess(res, formattedReplies);
  } catch (error) {
    next(error);
  }
};

// Admin: Create reply
export const createReply = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendValidationError(
        res,
        errors.array().map((e) => ({ field: e.type === 'field' ? e.path : 'unknown', message: e.msg }))
      );
      return;
    }

    if (!req.admin) {
      sendError(res, 'Admin authentication required', 401);
      return;
    }

    const repair = await RepairOrder.findById(req.params.id);

    if (!repair) {
      sendError(res, 'Repair order not found', 404);
      return;
    }

    const { content } = req.body;

    const reply = await Reply.create({
      repairOrderId: req.params.id,
      adminId: req.admin.id,
      content,
    });

    const admin = await Admin.findById(req.admin.id).select('displayName avatarUrl').lean();

    sendSuccess(
      res,
      {
        id: reply._id.toString(),
        repairOrderId: reply.repairOrderId.toString(),
        adminId: reply.adminId.toString(),
        adminName: admin?.displayName || 'Admin',
        adminAvatar: admin?.avatarUrl || '',
        content: reply.content,
        createdAt: reply.createdAt.toISOString(),
        updatedAt: reply.updatedAt.toISOString(),
      },
      'Reply created',
      201
    );
  } catch (error) {
    next(error);
  }
};

// Admin: Update reply
export const updateReply = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendValidationError(
        res,
        errors.array().map((e) => ({ field: e.type === 'field' ? e.path : 'unknown', message: e.msg }))
      );
      return;
    }

    if (!req.admin) {
      sendError(res, 'Admin authentication required', 401);
      return;
    }

    const { id: orderId, replyId } = req.params;
    const { content } = req.body;

    const repair = await RepairOrder.findById(orderId);
    if (!repair) {
      sendError(res, 'Repair order not found', 404);
      return;
    }

    const reply = await Reply.findById(replyId);
    if (!reply) {
      sendError(res, 'Reply not found', 404);
      return;
    }

    if (reply.repairOrderId.toString() !== orderId) {
      sendError(res, 'Reply does not belong to this repair order', 400);
      return;
    }

    reply.content = content;
    await reply.save();

    const admin = await Admin.findById(reply.adminId).select('displayName avatarUrl').lean();

    sendSuccess(res, {
      id: reply._id.toString(),
      repairOrderId: reply.repairOrderId.toString(),
      adminId: reply.adminId.toString(),
      adminName: admin?.displayName || 'Admin',
      adminAvatar: admin?.avatarUrl || '',
      content: reply.content,
      createdAt: reply.createdAt.toISOString(),
      updatedAt: reply.updatedAt.toISOString(),
    }, 'Reply updated');
  } catch (error) {
    next(error);
  }
};

// Admin: Delete reply
export const deleteReply = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendValidationError(
        res,
        errors.array().map((e) => ({ field: e.type === 'field' ? e.path : 'unknown', message: e.msg }))
      );
      return;
    }

    if (!req.admin) {
      sendError(res, 'Admin authentication required', 401);
      return;
    }

    const { id: orderId, replyId } = req.params;

    const repair = await RepairOrder.findById(orderId);
    if (!repair) {
      sendError(res, 'Repair order not found', 404);
      return;
    }

    const reply = await Reply.findById(replyId);
    if (!reply) {
      sendError(res, 'Reply not found', 404);
      return;
    }

    if (reply.repairOrderId.toString() !== orderId) {
      sendError(res, 'Reply does not belong to this repair order', 400);
      return;
    }

    await Reply.findByIdAndDelete(replyId);

    sendSuccess(res, null, 'Reply deleted');
  } catch (error) {
    next(error);
  }
};
