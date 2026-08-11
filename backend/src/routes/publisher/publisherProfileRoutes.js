const express = require('express');
const { body } = require('express-validator');
const publisherProfileController = require('../../controllers/publisher/publisherProfileController');
const { validateRequest } = require('../../middlewares/validateRequest');

const router = express.Router();

// GET /api/v1/publisher/profile
router.get('/', publisherProfileController.getProfile);

// PUT /api/v1/publisher/profile
router.put(
  '/',
  [
    body('display_name')
      .optional()
      .isString().trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('display_name must be between 2 and 100 characters'),
    body('bio')
      .optional()
      .isString().trim()
      .isLength({ max: 1000 })
      .withMessage('bio must be at most 1000 characters'),
    body('document_url')
      .optional()
      .isURL()
      .withMessage('document_url must be a valid URL'),
  ],
  validateRequest,
  publisherProfileController.updateProfile
);

module.exports = router;
