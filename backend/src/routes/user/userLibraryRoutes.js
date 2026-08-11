const express = require('express');
const { param, query, body } = require('express-validator');
const userLibraryController = require('../../controllers/user/userLibraryController');
const { validateRequest } = require('../../middlewares/validateRequest');

const router = express.Router();

const bookIdParam = [
  param('bookId').isUUID().withMessage('bookId must be a valid UUID'),
];

// GET /api/v1/user/library
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('sort_by')
      .optional()
      .isIn(['newest', 'title', 'last_read', 'progress'])
      .withMessage('sort_by must be one of: newest, title, last_read, progress'),
  ],
  validateRequest,
  userLibraryController.getLibrary
);

// GET /api/v1/user/library/:bookId
router.get('/:bookId', bookIdParam, validateRequest, userLibraryController.getLibraryBook);

// PATCH /api/v1/user/library/:bookId/progress
router.patch(
  '/:bookId/progress',
  [
    ...bookIdParam,
    body('progress_pages')
      .isInt({ min: 0 })
      .withMessage('progress_pages must be a non-negative integer'),
  ],
  validateRequest,
  userLibraryController.updateProgress
);

module.exports = router;
