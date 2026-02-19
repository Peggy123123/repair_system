import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/index.js';

interface UserPayload {
  id: string;
  type: 'user';
}

interface AdminPayload {
  id: string;
  type: 'admin';
  role?: 'super_admin' | 'admin' | 'moderator';
}

type TokenPayload = UserPayload | AdminPayload;

const getSignOptions = (): SignOptions => {
  const expiresIn = config.jwt.expiresIn;
  // Parse string like "7d" to seconds
  if (typeof expiresIn === 'string') {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (match) {
      const value = parseInt(match[1], 10);
      const unit = match[2];
      const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
      return { expiresIn: value * multipliers[unit] };
    }
  }
  return { expiresIn: 604800 }; // Default: 7 days in seconds
};

export const generateUserToken = (userId: string): string => {
  const payload: UserPayload = {
    id: userId,
    type: 'user',
  };
  return jwt.sign(payload, config.jwt.secret, getSignOptions());
};

export const generateAdminToken = (adminId: string): string => {
  const payload: AdminPayload = {
    id: adminId,
    type: 'admin',
  };
  return jwt.sign(payload, config.jwt.adminSecret, getSignOptions());
};

export const verifyUserToken = (token: string): UserPayload | null => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;
    if (decoded.type === 'user') {
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
};

export const verifyAdminToken = (token: string): AdminPayload | null => {
  try {
    const decoded = jwt.verify(token, config.jwt.adminSecret) as TokenPayload;
    if (decoded.type === 'admin') {
      return decoded as AdminPayload;
    }
    return null;
  } catch {
    return null;
  }
};
