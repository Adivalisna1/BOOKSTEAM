const express = require('express');
const { query } = require('express-validator');
const searchController = require('../../controllers/searchController');
const { validateRequest } = require('../../middlewares/validateRequest');

const router = express.Router();

const searchValidation = [
  query('q').optional().isString().trim().isLength({ max: 200 }).withMessage('query must be at most 200 characters'),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be between 1 and 50'),
  query('min_price').optional().isFloat({ min: 0 }).withMessage('min_price must be a non-negative number'),
  query('max_price').optional().isFloat({ min: 0 }).withMessage('max_price must be a non-negative number'),
  query('book_type').optional().isIn(['novel', 'comic', 'textbook', 'journal']).withMessage('book_type must be one of: novel, comic, textbook, journal'),
];

// GET /api/v1/search?q=keyword
router.get('/', searchValidation, validateRequest, searchController.searchBooks);

module.exports = router;
