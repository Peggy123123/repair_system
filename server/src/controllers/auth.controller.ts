import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import axios from 'axios';
import { User } from '../models/User.js';
import { generateUserToken } from '../utils/jwt.utils.js';
import { sendSuccess, sendError, sendValidationError } from '../utils/response.utils.js';
import { AppError } from '../middleware/error.middleware.js';
import { config } from '../config/index.js';

// For demo/testing: simple username/password login
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

    // Demo login for testing (matches frontend mock)
    if (username === 'user' && password === '123456') {
      // Find or create demo user
      let user = await User.findOne({ displayName: 'Demo User' });

      if (!user) {
        user = await User.create({
          displayName: 'Demo User',
          avatarUrl: 'https://via.placeholder.com/100',
          lineUserId: null,
          status: 'active',
        });
      }

      user.lastLoginAt = new Date();
      await user.save();

      const token = generateUserToken(user._id.toString());

      sendSuccess(res, {
        token,
        user: {
          id: user._id.toString(),
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          lineUserId: user.lineUserId,
        },
      });
      return;
    }

    sendError(res, 'Invalid credentials', 401);
  } catch (error) {
    next(error);
  }
};

// LINE LIFF login
export const lineLogin = async (
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

    const { accessToken } = req.body;

    // Verify LINE access token
    let lineProfile;
    try {
      const verifyResponse = await axios.get(
        'https://api.line.me/oauth2/v2.1/verify',
        {
          params: { access_token: accessToken },
        }
      );

      // Check if token is for our channel
      if (config.line.channelId && verifyResponse.data.client_id !== config.line.channelId) {
        throw new AppError('Invalid LINE channel', 401);
      }

      // Get user profile
      const profileResponse = await axios.get('https://api.line.me/v2/profile', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      lineProfile = profileResponse.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new AppError('Invalid LINE access token', 401);
      }
      throw error;
    }

    // Find or create user
    let user = await User.findOne({ lineUserId: lineProfile.userId });

    if (!user) {
      user = await User.create({
        lineUserId: lineProfile.userId,
        displayName: lineProfile.displayName,
        avatarUrl: lineProfile.pictureUrl || '',
        status: 'active',
      });
    } else {
      // Update profile info
      user.displayName = lineProfile.displayName;
      user.avatarUrl = lineProfile.pictureUrl || user.avatarUrl;
      user.lastLoginAt = new Date();
      await user.save();
    }

    const token = generateUserToken(user._id.toString());

    sendSuccess(res, {
      token,
      user: {
        id: user._id.toString(),
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        lineUserId: user.lineUserId,
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
  // JWT is stateless, so we just return success
  // Client should remove the token
  sendSuccess(res, null, 'Logged out successfully');
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    sendSuccess(res, {
      id: user._id.toString(),
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      lineUserId: user.lineUserId,
    });
  } catch (error) {
    next(error);
  }
};
