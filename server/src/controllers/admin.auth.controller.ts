import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Admin } from '../models/Admin.js';
import { generateAdminToken } from '../utils/jwt.utils.js';
import { sendSuccess, sendError, sendValidationError } from '../utils/response.utils.js';

export const login = async (
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

    const { username, password } = req.body;

    const admin = await Admin.findOne({ username: username.toLowerCase() });

    if (!admin) {
      sendError(res, 'Invalid credentials', 401);
      return;
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      sendError(res, 'Invalid credentials', 401);
      return;
    }

    admin.lastLoginAt = new Date();
    await admin.save();

    const token = generateAdminToken(admin._id.toString());

    sendSuccess(res, {
      token,
      admin: {
        id: admin._id.toString(),
        username: admin.username,
        displayName: admin.displayName,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  _req: Request,
  res: Response
): Promise<void> => {
  sendSuccess(res, null, 'Logged out successfully');
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.admin) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    const admin = await Admin.findById(req.admin.id).select('-password');

    if (!admin) {
      sendError(res, 'Admin not found', 404);
      return;
    }

    sendSuccess(res, {
      id: admin._id.toString(),
      username: admin.username,
      displayName: admin.displayName,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.admin) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      sendError(res, 'Current password and new password are required', 400);
      return;
    }

    if (newPassword.length < 6) {
      sendError(res, 'New password must be at least 6 characters', 400);
      return;
    }

    const admin = await Admin.findById(req.admin.id);

    if (!admin) {
      sendError(res, 'Admin not found', 404);
      return;
    }

    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      sendError(res, 'Current password is incorrect', 401);
      return;
    }

    admin.password = newPassword;
    await admin.save();

    sendSuccess(res, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};
