import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { RepairOrder } from '../models/RepairOrder.js';
import { User } from '../models/User.js';
import { Reply } from '../models/Reply.js';
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

    const { status, page = '1', limit = '10' } = req.query;

    const query: Record<string, unknown> = { userId: req.user.id };
    if (status && typeof status === 'string') {
      query.status = status;
    }

    // Parse pagination parameters
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Get total count
    const total = await RepairOrder.countDocuments(query);

    // Get paginated repairs
    const repairs = await RepairOrder.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
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
      isPrinted: r.isPrinted || false,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    sendSuccess(res, {
      items: formattedRepairs,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
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
        isPrinted: repair.isPrinted || false,
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
        isPrinted: repair.isPrinted || false,
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
        isPrinted: repair.isPrinted || false,
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
      isPrinted: repair.isPrinted || false,
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
    const {
      status,
      userId,
      deviceType,
      category,
      keyword,
      startDate,
      endDate,
      isPrinted,
      page = '1',
      limit = '10'
    } = req.query;

    const query: Record<string, unknown> = {};

    // Status filter
    if (status && typeof status === 'string') {
      query.status = status;
    }

    // User ID filter
    if (userId && typeof userId === 'string') {
      query.userId = userId;
    }

    // Device type filter
    if (deviceType && typeof deviceType === 'string') {
      query.deviceType = deviceType;
    }

    // Category filter
    if (category && typeof category === 'string') {
      query.category = category;
    }

    // Is printed filter
    if (isPrinted && typeof isPrinted === 'string') {
      query.isPrinted = isPrinted === 'true';
    }

    // Keyword search (title, description, supplements.content)
    if (keyword && typeof keyword === 'string') {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { 'supplements.content': { $regex: keyword, $options: 'i' } }
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate && typeof startDate === 'string') {
        query.createdAt = { ...query.createdAt as object, $gte: new Date(startDate) };
      }
      if (endDate && typeof endDate === 'string') {
        // Add 1 day to include the end date
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        query.createdAt = { ...query.createdAt as object, $lt: end };
      }
    }

    // Parse pagination parameters
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Get total count
    const total = await RepairOrder.countDocuments(query);

    // Get paginated repairs
    const repairs = await RepairOrder.find(query)
      .populate('userId', 'displayName avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Format repairs with reply counts
    const formattedRepairs = await Promise.all(
      repairs.map(async (r) => {
        const user = r.userId as unknown as { _id: string; displayName: string; avatarUrl: string } | null;
        // Count replies for this repair order
        const replyCount = await Reply.countDocuments({ repairOrderId: r._id });

        return {
          id: r._id.toString(),
          userId: typeof user === 'object' && user?._id ? user._id.toString() : r.userId?.toString() || '',
          userName: typeof user === 'object' && user?.displayName ? user.displayName : 'Unknown',
          userAvatar: typeof user === 'object' && user?.avatarUrl ? user.avatarUrl : '',
          category: r.category,
          title: r.title,
          description: r.description,
          deviceType: r.deviceType,
          attachmentUrl: r.attachmentUrl || '',
          attachmentUrls: r.attachmentUrls || [],
          supplements: r.supplements || [],
          repairContent: r.repairContent || '',
          notes: r.notes || '',
          isPrinted: r.isPrinted || false,
          replyCount,
          status: r.status,
          createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
        };
      })
    );

    sendSuccess(res, {
      items: formattedRepairs,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
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
      isPrinted: repair.isPrinted || false,
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

    // 更新 isPrinted 狀態
    await RepairOrder.findByIdAndUpdate(req.params.id, { isPrinted: true });

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
