import { Types } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        type: 'user' | 'admin';
      };
      admin?: {
        id: string;
        role: 'super_admin' | 'admin' | 'moderator';
      };
    }
  }
}

export {};
