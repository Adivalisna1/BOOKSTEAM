const adminUserService = require('../../services/admin/adminUserService');

/**
 * GET /api/v1/admin/users
 * Supports ?role=user|publisher|admin, ?is_banned=true|false, ?search=keyword
 */
async function listUsers(req, res, next) {
  try {
    const { page, limit, role, is_banned, search } = req.query;
    const result = await adminUserService.listUsers({
      page: parseInt(page, 10) || 1,
      limit: Math.min(parseInt(limit, 10) || 20, 50),
      role,
      is_banned: is_banned !== undefined ? is_banned === 'true' : undefined,
      search,
    });
    res.json({ success: true, data: result.users, pagination: result.pagination });
  } catch (err) { next(err); }
}

/**
 * GET /api/v1/admin/users/:id
 */
async function getUserById(req, res, next) {
  try {
    const user = await adminUserService.getUserById(req.params.id);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

/**
 * PATCH /api/v1/admin/users/:id/ban
 */
async function banUser(req, res, next) {
  try {
    const result = await adminUserService.banUser(req.params.id, req.user.id);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

/**
 * PATCH /api/v1/admin/users/:id/unban
 */
async function unbanUser(req, res, next) {
  try {
    const result = await adminUserService.unbanUser(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

module.exports = { listUsers, getUserById, banUser, unbanUser };
