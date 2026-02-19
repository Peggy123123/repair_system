import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { User } from '../models/User.js';
import { Admin } from '../models/Admin.js';
import { RepairOrder } from '../models/RepairOrder.js';
import { Reply } from '../models/Reply.js';
import { sendSuccess, sendError, sendValidationError } from '../utils/response.utils.js';

// Get all users
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '10',
      keyword,
      startDate,
      endDate,
      sortBy,
      sortOrder = 'desc'
    } = req.query;

    // Parse pagination parameters
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build match query
    const matchQuery: Record<string, unknown> = {};

    // Keyword search (displayName, _id, lineUserId)
    if (keyword && typeof keyword === 'string') {
      matchQuery.$or = [
        { displayName: { $regex: keyword, $options: 'i' } },
        { lineUserId: { $regex: keyword, $options: 'i' } }
      ];
    }

    // Date range filter (memberSince)
    if (startDate || endDate) {
      matchQuery.memberSince = {};
      if (startDate && typeof startDate === 'string') {
        matchQuery.memberSince = { ...matchQuery.memberSince as object, $gte: new Date(startDate) };
      }
      if (endDate && typeof endDate === 'string') {
        // Add 1 day to include the end date
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        matchQuery.memberSince = { ...matchQuery.memberSince as object, $lt: end };
      }
    }

    // Build sort object
    let sortObj: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortBy && typeof sortBy === 'string') {
      const order = sortOrder === 'asc' ? 1 : -1;

      if (sortBy === 'orderCount') {
        // For orderCount, we'll use aggregation pipeline
        sortObj = { orderCount: order };
      } else if (sortBy === 'points') {
        sortObj = { points: order };
      } else if (sortBy === 'memberSince') {
        sortObj = { memberSince: order };
      } else {
        sortObj = { createdAt: -1 };
      }
    }

    // If sorting by orderCount, use aggregation pipeline
    if (sortBy === 'orderCount') {
      const pipeline = [
        { $match: matchQuery },
        {
          $lookup: {
            from: 'repairorders',
            localField: '_id',
            foreignField: 'userId',
            as: 'orders'
          }
        },
        {
          $addFields: {
            orderCount: { $size: '$orders' }
          }
        },
        {
          $project: {
            orders: 0,
            password: 0
          }
        },
        { $sort: sortObj },
        {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: [{ $skip: skip }, { $limit: limitNum }]
          }
        }
      ];

      const result = await User.aggregate(pipeline);
      const total = result[0]?.metadata[0]?.total || 0;
      const users = result[0]?.data || [];

      const formattedUsers = users.map((u: any) => ({
        id: u._id.toString(),
        lineUserId: u.lineUserId,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
        status: u.status,
        points: u.points,
        memberSince: u.memberSince.toISOString(),
        createdAt: u.createdAt.toISOString(),
        lastLoginAt: u.lastLoginAt?.toISOString() || null,
      }));

      sendSuccess(res, {
        items: formattedUsers,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      });
    } else {
      // Standard query for other sorts
      const total = await User.countDocuments(matchQuery);

      const users = await User.find(matchQuery)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean();

      const formattedUsers = users.map((u) => ({
        id: u._id.toString(),
        lineUserId: u.lineUserId,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
        status: u.status,
        points: u.points,
        memberSince: u.memberSince.toISOString(),
        createdAt: u.createdAt.toISOString(),
        lastLoginAt: u.lastLoginAt?.toISOString() || null,
      }));

      sendSuccess(res, {
        items: formattedUsers,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      });
    }
  } catch (error) {
    next(error);
  }
};

// Get single user
export const getUserById = async (
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

    const user = await User.findById(req.params.id).lean();

    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    sendSuccess(res, {
      id: user._id.toString(),
      lineUserId: user.lineUserId,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      status: user.status,
      points: user.points,
      memberSince: user.memberSince.toISOString(),
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString() || null,
    });
  } catch (error) {
    next(error);
  }
};

// Get user's repair orders
export const getUserOrders = async (
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

    const {
      status,
      deviceType,
      category,
      keyword,
      startDate,
      endDate,
      isPrinted,
      page = '1',
      limit = '10'
    } = req.query;

    const user = await User.findById(req.params.id);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    const query: Record<string, unknown> = { userId: req.params.id };

    // Status filter
    if (status && typeof status === 'string') {
      query.status = status;
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
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Format repairs with reply counts
    const formattedRepairs = await Promise.all(
      repairs.map(async (r) => {
        // Count replies for this repair order
        const replyCount = await Reply.countDocuments({ repairOrderId: r._id });

        return {
          id: r._id.toString(),
          userId: r.userId.toString(),
          category: r.category,
          title: r.title,
          description: r.description,
          deviceType: r.deviceType,
          attachmentUrl: r.attachmentUrl,
          attachmentUrls: r.attachmentUrls,
          isPrinted: r.isPrinted || false,
          replyCount,
          status: r.status,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        };
      })
    );

    sendSuccess(res, {
      user: {
        id: user._id.toString(),
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        lineUserId: user.lineUserId,
        points: user.points,
        memberSince: user.memberSince.toISOString(),
        status: user.status,
      },
      orders: {
        items: formattedRepairs,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update user
export const updateUser = async (
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

    const allowedUpdates = ['displayName', 'status', 'points'];
    const updates: Record<string, unknown> = {};

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    sendSuccess(res, {
      id: user._id.toString(),
      lineUserId: user.lineUserId,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      status: user.status,
      points: user.points,
      memberSince: user.memberSince.toISOString(),
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString() || null,
    });
  } catch (error) {
    next(error);
  }
};

// Get all admins
export const getAdmins = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const admins = await Admin.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    const formattedAdmins = admins.map((a) => ({
      id: a._id.toString(),
      username: a.username,
      displayName: a.displayName,
      createdAt: a.createdAt.toISOString(),
      lastLoginAt: a.lastLoginAt?.toISOString() || null,
    }));

    sendSuccess(res, formattedAdmins);
  } catch (error) {
    next(error);
  }
};

// Create admin
export const createAdmin = async (
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

    const { username, password, displayName } = req.body;

    const existingAdmin = await Admin.findOne({ username: username.toLowerCase() });
    if (existingAdmin) {
      sendError(res, 'Username already exists', 400);
      return;
    }

    const admin = await Admin.create({
      username,
      password,
      displayName,
    });

    sendSuccess(
      res,
      {
        id: admin._id.toString(),
        username: admin.username,
        displayName: admin.displayName,
        createdAt: admin.createdAt.toISOString(),
      },
      'Admin created',
      201
    );
  } catch (error) {
    next(error);
  }
};

// Update admin
export const updateAdmin = async (
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

    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      sendError(res, 'Admin not found', 404);
      return;
    }

    const allowedUpdates = ['displayName', 'password'];

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        (admin as unknown as Record<string, unknown>)[key] = req.body[key];
      }
    }

    await admin.save();

    sendSuccess(res, {
      id: admin._id.toString(),
      username: admin.username,
      displayName: admin.displayName,
      createdAt: admin.createdAt.toISOString(),
      lastLoginAt: admin.lastLoginAt?.toISOString() || null,
    });
  } catch (error) {
    next(error);
  }
};

// Delete admin
export const deleteAdmin = async (
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

    // Prevent deleting yourself
    if (req.admin && req.params.id === req.admin.id) {
      sendError(res, 'Cannot delete your own account', 400);
      return;
    }

    const admin = await Admin.findByIdAndDelete(req.params.id);

    if (!admin) {
      sendError(res, 'Admin not found', 404);
      return;
    }

    sendSuccess(res, null, 'Admin deleted');
  } catch (error) {
    next(error);
  }
};
