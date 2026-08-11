const express = require('express');
const { query, param } = require('express-validator');
const bookController = require('../../controllers/bookController');
const { validateRequest } = require('../../middlewares/validateRequest');

const router = express.Router();

/**
 * Validation rules shared for list & filter endpoints
 */
const listBooksValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be between 1 and 50'),
  query('min_price').optional().isFloat({ min: 0 }).withMessage('min_price must be a non-negative number'),
  query('max_price').optional().isFloat({ min: 0 }).withMessage('max_price must be a non-negative number'),
  query('sort_by').optional().isIn(['newest', 'price', 'rating', 'popular', 'title']).withMessage('sort_by must be one of: newest, price, rating, popular, title'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('order must be asc or desc'),
  query('book_type').optional().isIn(['novel', 'comic', 'textbook', 'journal']).withMessage('book_type must be one of: novel, comic, textbook, journal'),
];

const bookIdValidation = [
  param('id').isUUID().withMessage('id must be a valid UUID'),
];

const reviewsValidation = [
  param('id').isUUID().withMessage('id must be a valid UUID'),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be between 1 and 50'),
  query('sort_by').optional().isIn(['newest', 'helpful', 'rating_high', 'rating_low']).withMessage('sort_by must be one of: newest, helpful, rating_high, rating_low'),
];

// GET /api/v1/books
router.get('/', listBooksValidation, validateRequest, bookController.listBooks);

// GET /api/v1/books/featured
router.get('/featured', bookController.getFeaturedBooks);

// GET /api/v1/books/new-releases
router.get('/new-releases', bookController.getNewReleases);

// GET /api/v1/books/top-rated
router.get('/top-rated', bookController.getTopRatedBooks);

// GET /api/v1/books/:id
router.get('/:id', bookIdValidation, validateRequest, bookController.getBookById);

// GET /api/v1/books/:id/reviews
router.get('/:id/reviews', reviewsValidation, validateRequest, bookController.getBookReviews);

module.exports = router;
