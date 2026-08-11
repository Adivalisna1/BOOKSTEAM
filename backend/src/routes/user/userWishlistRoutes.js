const express = require('express');
const { param, query } = require('express-validator');
const userWishlistController = require('../../controllers/user/userWishlistController');
const { validateRequest } = require('../../middlewares/validateRequest');

const router = express.Router();

const bookIdParam = [
  param('bookId').isUUID().withMessage('bookId must be a valid UUID'),
];

// GET /api/v1/user/wishlist
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ],
  validateRequest,
  userWishlistController.getWishlist
);

// POST /api/v1/user/wishlist/:bookId
router.post('/:bookId', bookIdParam, validateRequest, userWishlistController.addToWishlist);

// DELETE /api/v1/user/wishlist/:bookId
router.delete('/:bookId', bookIdParam, validateRequest, userWishlistController.removeFromWishlist);

module.exports = router;
