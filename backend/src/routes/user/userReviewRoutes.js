const express = require('express');
const { param, body } = require('express-validator');
const userReviewController = require('../../controllers/user/userReviewController');
const { validateRequest } = require('../../middlewares/validateRequest');

const router = express.Router();

const bookIdParam = [
  param('bookId').isUUID().withMessage('bookId must be a valid UUID'),
];

const ratingBody = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('rating must be an integer between 1 and 5'),
  body('content')
    .optional()
    .isString().trim()
    .isLength({ max: 2000 })
    .withMessage('content must be at most 2000 characters'),
];

// POST /api/v1/user/reviews/:bookId
router.post('/:bookId', [...bookIdParam, ...ratingBody], validateRequest, userReviewController.createReview);

// PUT /api/v1/user/reviews/:bookId
router.put(
  '/:bookId',
  [
    ...bookIdParam,
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('rating must be between 1 and 5'),
    body('content').optional().isString().trim().isLength({ max: 2000 }),
  ],
  validateRequest,
  userReviewController.updateReview
);

// DELETE /api/v1/user/reviews/:bookId
router.delete('/:bookId', bookIdParam, validateRequest, userReviewController.deleteReview);

module.exports = router;
