import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { RepairOrder } from '../models/RepairOrder.js';
import { User } from '../models/User.js';
import { sendSuccess, sendError, sendValidationError } from '../utils/response.utils.js';
import { generateWorkOrderPDF } from '../utils/pdfGenerator.js';

// Get user's repair orders
export const getMyRepairs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    const { status } = req.query;

    const query: Record<string, unknown> = { userId: req.user.id };
    if (status && typeof status === 'string') {
      query.status = status;
    }

    const repairs = await RepairOrder.find(query)
      .sort({ createdAt: -1 })
      .lean();

    const formattedRepairs = repairs.map((r) => ({
      id: r._id.toString(),
      userId: r.userId.toString(),
      category: r.category,
      title: r.title,
      description: r.description,
      deviceType: r.deviceType,
      attachmentUrl: r.attachmentUrl,
      attachmentUrls: r.attachmentUrls,
      supplements: r.supplements,
      repairContent: r.repairContent || '',
      notes: r.notes || '',
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    sendSuccess(res, formattedRepairs);
  } catch (error) {
    next(error);
  }
};

// Get single repair order
export const getRepairById = async (
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

    const isAdmin = req.user.type !== 'user';

    let query = RepairOrder.findById(req.params.id);
    if (isAdmin) {
      query = query.populate('userId', 'displayName avatarUrl');
    }
    const repair = await query.lean();

    if (!repair) {
      sendError(res, 'Repair order not found', 404);
      return;
    }

    // Users can only view their own requests, admins can view all
    if (!isAdmin && repair.userId.toString() !== req.user.id) {
      sendError(res, 'Not authorized', 403);
      return;
    }

    if (isAdmin) {
      const user = repair.userId as unknown as { _id: string; displayName: string; avatarUrl: string } | null;
      sendSuccess(res, {
        id: repair._id.toString(),
        userId: user?._id?.toString() || '',
        userName: user?.displayName || 'Unknown',
        userAvatar: user?.avatarUrl || '',
        category: repair.category,
        title: repair.title,
        description: repair.description,
        deviceType: repair.deviceType,
        attachmentUrl: repair.attachmentUrl,
        attachmentUrls: repair.attachmentUrls,
        supplements: repair.supplements,
        repairContent: repair.repairContent || '',
        notes: repair.notes || '',
        status: repair.status,
        createdAt: repair.createdAt.toISOString(),
        updatedAt: repair.updatedAt.toISOString(),
      });
    } else {
      sendSuccess(res, {
        id: repair._id.toString(),
        userId: repair.userId.toString(),
        category: repair.category,
        title: repair.title,
        description: repair.description,
        deviceType: repair.deviceType,
        attachmentUrl: repair.attachmentUrl,
        attachmentUrls: repair.attachmentUrls,
        supplements: repair.supplements,
        repairContent: repair.repairContent || '',
        notes: repair.notes || '',
        status: repair.status,
        createdAt: repair.createdAt.toISOString(),
        updatedAt: repair.updatedAt.toISOString(),
      });
    }
  } catch (error) {
    next(error);
  }
};

// Create repair order
export const createRepair = async (
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

    const { category, title, description, deviceType, attachmentUrl, attachmentUrls } = req.body;

    const repair = await RepairOrder.create({
      userId: req.user.id,
      category,
      title,
      description,
      deviceType,
      attachmentUrl: attachmentUrl || '',
      attachmentUrls: attachmentUrls || [],
      status: 'pending',
    });

    sendSuccess(
      res,
      {
        id: repair._id.toString(),
        userId: repair.userId.toString(),
        category: repair.category,
        title: repair.title,
        description: repair.description,
        deviceType: repair.deviceType,
        attachmentUrl: repair.attachmentUrl,
        attachmentUrls: repair.attachmentUrls,
        supplements: repair.supplements,
        repairContent: repair.repairContent || '',
        status: repair.status,
        createdAt: repair.createdAt.toISOString(),
        updatedAt: repair.updatedAt.toISOString(),
      },
      'Repair order created',
      201
    );
  } catch (error) {
    next(error);
  }
};

// Add supplement to repair order
export const addSupplement = async (
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

    if (repair.userId.toString() !== req.user.id) {
      sendError(res, 'Not authorized', 403);
      return;
    }

    const { content, attachmentUrls } = req.body;

    repair.supplements.push({
      content,
      attachmentUrls: attachmentUrls || [],
      createdAt: new Date(),
    });

    await repair.save();

    sendSuccess(res, {
      id: repair._id.toString(),
      userId: repair.userId.toString(),
      category: repair.category,
      title: repair.title,
      description: repair.description,
      deviceType: repair.deviceType,
      attachmentUrl: repair.attachmentUrl,
      attachmentUrls: repair.attachmentUrls,
      supplements: repair.supplements,
      repairContent: repair.repairContent || '',
      notes: repair.notes || '',
      status: repair.status,
      createdAt: repair.createdAt.toISOString(),
      updatedAt: repair.updatedAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all repair orders
export const getAllRepairs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, userId } = req.query;

    const query: Record<string, unknown> = {};
    if (status && typeof status === 'string') {
      query.status = status;
    }
    if (userId && typeof userId === 'string') {
      query.userId = userId;
    }

    const repairs = await RepairOrder.find(query)
      .populate('userId', 'displayName avatarUrl')
      .sort({ createdAt: -1 })
      .lean();

    const formattedRepairs = repairs.map((r) => {
      const user = r.userId as unknown as { _id: string; displayName: string; avatarUrl: string } | null;
      return {
        id: r._id.toString(),
        userId: user?._id?.toString() || '',
        userName: user?.displayName || 'Unknown',
        userAvatar: user?.avatarUrl || '',
        category: r.category,
        title: r.title,
        description: r.description,
        deviceType: r.deviceType,
        attachmentUrl: r.attachmentUrl,
        attachmentUrls: r.attachmentUrls,
        supplements: r.supplements,
        repairContent: r.repairContent || '',
        notes: r.notes || '',
        status: r.status,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      };
    });

    sendSuccess(res, formattedRepairs);
  } catch (error) {
    next(error);
  }
};

// Admin: Update repair order
export const updateRepair = async (
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

    const allowedUpdates = ['status', 'category', 'title', 'description', 'deviceType', 'repairContent', 'notes'];
    const updates: Record<string, unknown> = {};

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const repair = await RepairOrder.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!repair) {
      sendError(res, 'Repair order not found', 404);
      return;
    }

    sendSuccess(res, {
      id: repair._id.toString(),
      userId: repair.userId.toString(),
      category: repair.category,
      title: repair.title,
      description: repair.description,
      deviceType: repair.deviceType,
      attachmentUrl: repair.attachmentUrl,
      attachmentUrls: repair.attachmentUrls,
      supplements: repair.supplements,
      repairContent: repair.repairContent || '',
      notes: repair.notes || '',
      status: repair.status,
      createdAt: repair.createdAt.toISOString(),
      updatedAt: repair.updatedAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete repair order
export const deleteRepair = async (
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

    const repair = await RepairOrder.findByIdAndDelete(req.params.id);

    if (!repair) {
      sendError(res, 'Repair order not found', 404);
      return;
    }

    sendSuccess(res, null, 'Repair order deleted');
  } catch (error) {
    next(error);
  }
};

// Admin: Generate PDF work order
const DEVICE_TYPE_NAMES: Record<string, string> = {
  mac: 'MAC',
  laptop: '筆電',
  computer: '電腦',
  other: '其它',
};

export const generatePDF = async (
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

    const repair = await RepairOrder.findById(req.params.id)
      .populate('userId', 'displayName')
      .lean();

    if (!repair) {
      sendError(res, 'Repair order not found', 404);
      return;
    }

    const user = repair.userId as unknown as { displayName: string } | null;
    const userName = user?.displayName || '未知使用者';

    const pdfBuffer = await generateWorkOrderPDF({
      userName,
      deviceType: DEVICE_TYPE_NAMES[repair.deviceType] || repair.deviceType,
      category: repair.category,
      createdAt: repair.createdAt.toISOString(),
      description: repair.description,
      repairContent: repair.repairContent || '',
    });

    // 生成檔名：維修工單_使用者名稱_列印日期
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const fileName = `維修工單_${userName}_${dateStr}.pdf`;
    const encodedFileName = encodeURIComponent(fileName);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};
