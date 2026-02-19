import { Request, Response, NextFunction } from 'express';
import { verifyUserToken, verifyAdminToken } from '../utils/jwt.utils.js';
import { sendError } from '../utils/response.utils.js';

export const authenticateUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'No token provided', 401);
    return;
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyUserToken(token);

  if (!decoded) {
    sendError(res, 'Invalid or expired token', 401);
    return;
  }

  req.user = {
    id: decoded.id,
    type: 'user',
  };

  next();
};

export const authenticateAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'No token provided', 401);
    return;
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAdminToken(token);

  if (!decoded) {
    sendError(res, 'Invalid or expired token', 401);
    return;
  }

  req.user = {
    id: decoded.id,
    type: 'admin',
  };

  req.admin = {
    id: decoded.id,
    role: decoded.role || 'admin',
  };

  next();
};

// Middleware that accepts both user and admin tokens
export const authenticateAny = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'No token provided', 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  // Try user token first
  const userDecoded = verifyUserToken(token);
  if (userDecoded) {
    req.user = {
      id: userDecoded.id,
      type: 'user',
    };
    next();
    return;
  }

  // Try admin token
  const adminDecoded = verifyAdminToken(token);
  if (adminDecoded) {
    req.user = {
      id: adminDecoded.id,
      type: 'admin',
    };
    req.admin = {
      id: adminDecoded.id,
      role: adminDecoded.role || 'admin',
    };
    next();
    return;
  }

  sendError(res, 'Invalid or expired token', 401);
};
