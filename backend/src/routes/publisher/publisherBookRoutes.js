const express = require('express');
const { param, query, body } = require('express-validator');
const publisherBookController = require('../../controllers/publisher/publisherBookController');
const { validateRequest } = require('../../middlewares/validateRequest');

const router = express.Router();

const bookIdParam = [
  param('id').isUUID().withMessage('id must be a valid UUID'),
];

const createBookBody = [
  body('title')
    .isString().trim().notEmpty()
    .isLength({ max: 255 })
    .withMessage('title is required (max 255 chars)'),
  body('description')
    .optional().isString().trim(),
  body('cover_url')
    .optional().isURL().withMessage('cover_url must be a valid URL'),
  body('file_url')
    .optional().isURL().withMessage('file_url must be a valid URL'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('price must be a non-negative number'),
  body('book_type')
    .isIn(['novel', 'comic', 'textbook', 'journal'])
    .withMessage('book_type must be one of: novel, comic, textbook, journal'),
  body('genre')
    .isString().trim().notEmpty()
    .withMessage('genre is required'),
  body('language')
    .optional().isString().isLength({ min: 2, max: 10 }),
  body('is_family_shareable')
    .optional().isBoolean(),
  body('is_early_access')
    .optional().isBoolean(),
  body('total_pages')
    .optional().isInt({ min: 0 }),
  body('tags')
    .optional().isArray()
    .withMessage('tags must be an array'),
  body('tags.*')
    .optional().isString().trim()
    .isLength({ max: 50 })
    .withMessage('each tag must be at most 50 characters'),
];

const updateBookBody = [
  body('title')
    .optional().isString().trim().isLength({ max: 255 }),
  body('description')
    .optional().isString().trim(),
  body('cover_url')
    .optional().isURL(),
  body('file_url')
    .optional().isURL(),
  body('price')
    .optional().isFloat({ min: 0 }),
  body('book_type')
    .optional().isIn(['novel', 'comic', 'textbook', 'journal']),
  body('genre')
    .optional().isString().trim().notEmpty(),
  body('language')
    .optional().isString().isLength({ min: 2, max: 10 }),
  body('is_family_shareable')
    .optional().isBoolean(),
  body('is_early_access')
    .optional().isBoolean(),
  body('total_pages')
    .optional().isInt({ min: 0 }),
  body('tags')
    .optional().isArray(),
  body('tags.*')
    .optional().isString().trim().isLength({ max: 50 }),
];

const paginationQuery = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
];

// GET /api/v1/publisher/books
router.get(
  '/',
  [
    ...paginationQuery,
    query('status')
      .optional()
      .isIn(['pending', 'approved', 'rejected', 'takedown'])
      .withMessage('status must be one of: pending, approved, rejected, takedown'),
    query('book_type')
      .optional()
      .isIn(['novel', 'comic', 'textbook', 'journal']),
  ],
  validateRequest,
  publisherBookController.listBooks
);

// GET /api/v1/publisher/books/:id
router.get('/:id', bookIdParam, validateRequest, publisherBookController.getBookById);

// POST /api/v1/publisher/books
router.post('/', createBookBody, validateRequest, publisherBookController.createBook);

// PUT /api/v1/publisher/books/:id
router.put('/:id', [...bookIdParam, ...updateBookBody], validateRequest, publisherBookController.updateBook);

// DELETE /api/v1/publisher/books/:id
router.delete('/:id', bookIdParam, validateRequest, publisherBookController.deleteBook);

// GET /api/v1/publisher/books/:id/sales
router.get(
  '/:id/sales',
  [...bookIdParam, ...paginationQuery],
  validateRequest,
  publisherBookController.getBookSales
);

module.exports = router;
