const express = require('express');
const { param, query } = require('express-validator');
const adminUserController = require('../../controllers/admin/adminUserController');
const { validateRequest } = require('../../middlewares/validateRequest');

const router = express.Router();

const userIdParam = [
  param('id').isUUID().withMessage('id must be a valid UUID'),
];

// GET /api/v1/admin/users
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('role').optional().isIn(['user', 'publisher', 'admin']),
    query('is_banned').optional().isBoolean(),
    query('search').optional().isString().trim().isLength({ max: 100 }),
  ],
  validateRequest,
  adminUserController.listUsers
);

// GET /api/v1/admin/users/:id
router.get('/:id', userIdParam, validateRequest, adminUserController.getUserById);

// PATCH /api/v1/admin/users/:id/ban
router.patch('/:id/ban', userIdParam, validateRequest, adminUserController.banUser);

// PATCH /api/v1/admin/users/:id/unban
router.patch('/:id/unban', userIdParam, validateRequest, adminUserController.unbanUser);

module.exports = router;
