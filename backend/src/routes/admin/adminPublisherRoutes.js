const express = require('express');
const { param, query, body } = require('express-validator');
const adminPublisherController = require('../../controllers/admin/adminPublisherController');
const { validateRequest } = require('../../middlewares/validateRequest');

const router = express.Router();

const publisherIdParam = [
  param('id').isUUID().withMessage('id must be a valid UUID'),
];

// GET /api/v1/admin/publishers
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('status').optional().isIn(['pending', 'approved', 'rejected']),
  ],
  validateRequest,
  adminPublisherController.listPublishers
);

// GET /api/v1/admin/publishers/:id
router.get('/:id', publisherIdParam, validateRequest, adminPublisherController.getPublisherById);

// PATCH /api/v1/admin/publishers/:id/approve
router.patch('/:id/approve', publisherIdParam, validateRequest, adminPublisherController.approvePublisher);

// PATCH /api/v1/admin/publishers/:id/reject
router.patch(
  '/:id/reject',
  [
    ...publisherIdParam,
    body('reason').isString().trim().isLength({ min: 5 }).withMessage('reason is required (min 5 chars)'),
  ],
  validateRequest,
  adminPublisherController.rejectPublisher
);

module.exports = router;
