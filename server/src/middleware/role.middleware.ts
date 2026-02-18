import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.utils.js';

type AdminRole = 'super_admin' | 'admin' | 'moderator';

const roleHierarchy: Record<AdminRole, number> = {
  super_admin: 3,
  admin: 2,
  moderator: 1,
};

export const requireRole = (...allowedRoles: AdminRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      sendError(res, 'Admin authentication required', 401);
      return;
    }

    const hasRole = allowedRoles.includes(req.admin.role);
    if (!hasRole) {
      sendError(res, 'Insufficient permissions', 403);
      return;
    }

    next();
  };
};

export const requireMinRole = (minRole: AdminRole) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      sendError(res, 'Admin authentication required', 401);
      return;
    }

    const userRoleLevel = roleHierarchy[req.admin.role];
    const requiredRoleLevel = roleHierarchy[minRole];

    if (userRoleLevel < requiredRoleLevel) {
      sendError(res, 'Insufficient permissions', 403);
      return;
    }

    next();
  };
};
