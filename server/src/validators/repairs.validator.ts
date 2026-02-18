import { body, param } from 'express-validator';

export const createRepairValidator = [
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title must be at most 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('deviceType')
    .isIn(['mac', 'laptop', 'computer', 'other'])
    .withMessage('Invalid device type'),
  body('attachmentUrl')
    .optional()
    .isString(),
  body('attachmentUrls')
    .optional()
    .isArray(),
  body('attachmentUrls.*')
    .optional()
    .isString(),
];

export const updateRepairValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid repair request ID'),
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'repairing', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Title must be at most 100 characters'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty'),
  body('repairContent')
    .optional()
    .isString()
    .withMessage('Repair content must be a string'),
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string'),
  body('deviceType')
    .optional()
    .isIn(['mac', 'laptop', 'computer', 'other'])
    .withMessage('Invalid device type'),
];

export const supplementValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid repair request ID'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required'),
  body('attachmentUrls')
    .optional()
    .isArray(),
  body('attachmentUrls.*')
    .optional()
    .isString(),
];

export const replyValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid repair request ID'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Reply content is required'),
];

export const idParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID'),
];
