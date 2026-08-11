const express = require('express');
const { param, query, body } = require('express-validator');
const adminBookController = require('../../controllers/admin/adminBookController');
const { validateRequest } = require('../../middlewares/validateRequest');

const router = express.Router();

const bookIdParam = [
  param('id').isUUID().withMessage('id must be a valid UUID'),
];

const reasonBody = [
  body('reason').optional().isString().trim().isLength({ min: 5 }).withMessage('reason must be at least 5 characters'),
];

// GET /api/v1/admin/books
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('status').optional().isIn(['pending', 'approved', 'rejected', 'takedown']),
    query('book_type').optional().isIn(['novel', 'comic', 'textbook', 'journal']),
  ],
  validateRequest,
  adminBookController.listBooks
);

// GET /api/v1/admin/books/:id
router.get('/:id', bookIdParam, validateRequest, adminBookController.getBookById);

// PATCH /api/v1/admin/books/:id/approve
router.patch('/:id/approve', bookIdParam, validateRequest, adminBookController.approveBook);

// PATCH /api/v1/admin/books/:id/reject
router.patch('/:id/reject', [...bookIdParam, ...reasonBody], validateRequest, adminBookController.rejectBook);

// PATCH /api/v1/admin/books/:id/takedown
router.patch('/:id/takedown', [...bookIdParam, ...reasonBody], validateRequest, adminBookController.takedownBook);

// PATCH /api/v1/admin/books/:id/toggle-featured
router.patch('/:id/toggle-featured', bookIdParam, validateRequest, adminBookController.toggleFeatured);

module.exports = router;
