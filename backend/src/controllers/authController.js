const authService = require('../services/authService');

/**
 * POST /api/v1/auth/register
 * Body: { email, username, password }
 */
async function register(req, res, next) {
  try {
    const { email, username, password } = req.body;
    const result = await authService.register({ email, username, password });
    res.status(201).json({ success: true, ...result });
  } catch (err) { next(err); }
}

/**
 * POST /api/v1/auth/login
 * Body: { email, password }
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

/**
 * POST /api/v1/auth/logout
 * Body: { refresh_token }
 */
async function logout(req, res, next) {
  try {
    const result = await authService.logout(req.body.refresh_token);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

/**
 * POST /api/v1/auth/refresh
 * Body: { refresh_token }
 */
async function refresh(req, res, next) {
  try {
    const result = await authService.refreshAccessToken(req.body.refresh_token);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

/**
 * GET /api/v1/auth/me
 * Requires: Authorization: Bearer <access_token>
 */
async function me(req, res, next) {
  try {
    const user = await authService.getMe(req.user.id);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

/**
 * POST /api/v1/auth/verify-email
 * Body: { token }
 */
async function verifyEmail(req, res, next) {
  try {
    const result = await authService.verifyEmail(req.body.token);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

/**
 * POST /api/v1/auth/resend-verification
 * Requires: Authorization: Bearer <access_token>
 */
async function resendVerification(req, res, next) {
  try {
    const result = await authService.resendVerification(req.user.id);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

/**
 * POST /api/v1/auth/forgot-password
 * Body: { email }
 */
async function forgotPassword(req, res, next) {
  try {
    const result = await authService.forgotPassword(req.body.email);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

/**
 * POST /api/v1/auth/reset-password
 * Body: { token, password }
 */
async function resetPassword(req, res, next) {
  try {
    const result = await authService.resetPassword(req.body.token, req.body.password);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

module.exports = {
  register,
  login,
  logout,
  refresh,
  me,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
};
