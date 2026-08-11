const express = require('express');
const { param, body, query } = require('express-validator');
const adminEventController = require('../../controllers/admin/adminEventController');
const { validateRequest } = require('../../middlewares/validateRequest');

const router = express.Router();

const eventIdParam = [
  param('id').isUUID().withMessage('id must be a valid UUID'),
];

const eventBody = [
  body('title').isString().trim().notEmpty().withMessage('title is required'),
  body('description').optional().isString().trim(),
  body('banner_url').optional().isURL().withMessage('banner_url must be a valid URL'),
  body('link_url').optional().isString().trim(),
  body('start_date').isISO8601().withMessage('start_date must be a valid ISO date'),
  body('end_date').optional().isISO8601().withMessage('end_date must be a valid ISO date'),
  body('is_active').optional().isBoolean().withMessage('is_active must be boolean'),
];

const eventBodyUpdate = [
  body('title').optional().isString().trim().notEmpty(),
  body('description').optional().isString().trim(),
  body('banner_url').optional().isURL().withMessage('banner_url must be a valid URL'),
  body('link_url').optional().isString().trim(),
  body('start_date').optional().isISO8601(),
  body('end_date').optional().isISO8601(),
  body('is_active').optional().isBoolean(),
];

// GET /api/v1/admin/events
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('is_active').optional().isBoolean(),
  ],
  validateRequest,
  adminEventController.listEvents
);

// GET /api/v1/admin/events/:id
router.get('/:id', eventIdParam, validateRequest, adminEventController.getEventById);

// POST /api/v1/admin/events
router.post('/', eventBody, validateRequest, adminEventController.createEvent);

// PUT /api/v1/admin/events/:id
router.put('/:id', [...eventIdParam, ...eventBodyUpdate], validateRequest, adminEventController.updateEvent);

// DELETE /api/v1/admin/events/:id
router.delete('/:id', eventIdParam, validateRequest, adminEventController.deleteEvent);

module.exports = router;
