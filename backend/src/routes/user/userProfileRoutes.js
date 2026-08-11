const express = require('express');
const { body, query } = require('express-validator');
const userProfileController = require('../../controllers/user/userProfileController');
const { validateRequest } = require('../../middlewares/validateRequest');

const router = express.Router();

// GET /api/v1/user/profile
router.get('/', userProfileController.getProfile);

// PUT /api/v1/user/profile
router.put(
  '/',
  [
    body('username')
      .optional()
      .isString().trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('username must be between 3 and 50 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('username can only contain letters, numbers, and underscores'),
    body('avatar_url')
      .optional()
      .isURL()
      .withMessage('avatar_url must be a valid URL'),
  ],
  validateRequest,
  userProfileController.updateProfile
);

// GET /api/v1/user/exp
router.get(
  '/exp',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ],
  validateRequest,
  userProfileController.getExpHistory
);

module.exports = router;
