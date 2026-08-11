const userProfileService = require('../../services/user/userProfileService');

/** GET /api/v1/user/profile */
async function getProfile(req, res, next) {
  try {
    const profile = await userProfileService.getProfile(req.user.id);
    res.json({ success: true, data: profile });
  } catch (err) { next(err); }
}

/** PUT /api/v1/user/profile */
async function updateProfile(req, res, next) {
  try {
    const { username, avatar_url } = req.body;
    const profile = await userProfileService.updateProfile(req.user.id, { username, avatar_url });
    res.json({ success: true, data: profile });
  } catch (err) { next(err); }
}

/** GET /api/v1/user/exp */
async function getExpHistory(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await userProfileService.getExpHistory(req.user.id, {
      page: parseInt(page, 10) || 1,
      limit: Math.min(parseInt(limit, 10) || 20, 50),
    });
    res.json({ success: true, data: result.exp_history, pagination: result.pagination });
  } catch (err) { next(err); }
}

module.exports = { getProfile, updateProfile, getExpHistory };
