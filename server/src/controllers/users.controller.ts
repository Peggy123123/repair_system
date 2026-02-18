import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { User } from '../models/User.js';
import { Admin } from '../models/Admin.js';
import { RepairOrder } from '../models/RepairOrder.js';
import { sendSuccess, sendError, sendValidationError } from '../utils/response.utils.js';

// Get all users
export const getUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .lean();

    const formattedUsers = users.map((u) => ({
      id: u._id.toString(),
      lineUserId: u.lineUserId,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
      status: u.status,
      createdAt: u.createdAt.toISOString(),
      lastLoginAt: u.lastLoginAt?.toISOString() || null,
    }));

    sendSuccess(res, formattedUsers);
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

    const user = await User.findById(req.params.id);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    const repairs = await RepairOrder.find({ userId: req.params.id })
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
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    sendSuccess(res, {
      user: {
        id: user._id.toString(),
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
      orders: formattedRepairs,
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

    const allowedUpdates = ['displayName', 'status'];
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
      avatarUrl: a.avatarUrl,
      role: a.role,
      status: a.status,
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

    const { username, password, displayName, role } = req.body;

    const existingAdmin = await Admin.findOne({ username: username.toLowerCase() });
    if (existingAdmin) {
      sendError(res, 'Username already exists', 400);
      return;
    }

    const admin = await Admin.create({
      username,
      password,
      displayName,
      role: role || 'admin',
      status: 'active',
    });

    sendSuccess(
      res,
      {
        id: admin._id.toString(),
        username: admin.username,
        displayName: admin.displayName,
        avatarUrl: admin.avatarUrl,
        role: admin.role,
        status: admin.status,
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

    const allowedUpdates = ['displayName', 'password', 'role', 'status', 'avatarUrl'];

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
      avatarUrl: admin.avatarUrl,
      role: admin.role,
      status: admin.status,
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
