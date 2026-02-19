import { body, param } from 'express-validator';

export const updateUserValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('displayName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Display name cannot be empty'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Invalid status'),
  body('points')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Points must be a non-negative integer'),
];

export const createAdminValidator = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('displayName')
    .trim()
    .notEmpty()
    .withMessage('Display name is required'),
  body('role')
    .optional()
    .isIn(['super_admin', 'admin', 'moderator'])
    .withMessage('Invalid role'),
];

export const updateAdminValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid admin ID'),
  body('displayName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Display name cannot be empty'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['super_admin', 'admin', 'moderator'])
    .withMessage('Invalid role'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Invalid status'),
];

export const idParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID'),
];
