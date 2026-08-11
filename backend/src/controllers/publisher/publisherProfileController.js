const publisherProfileService = require('../../services/publisher/publisherProfileService');

/** GET /api/v1/publisher/profile */
async function getProfile(req, res, next) {
  try {
    const profile = await publisherProfileService.getProfile(req.user.id);
    res.json({ success: true, data: profile });
  } catch (err) { next(err); }
}

/**
 * POST /api/v1/publisher/apply
 * Any logged-in user can apply to become a publisher.
 * Body: { display_name, bio?, document_url? }
 */
async function applyAsPublisher(req, res, next) {
  try {
    const { display_name, bio, document_url } = req.body;
    const result = await publisherProfileService.applyAsPublisher(req.user.id, {
      display_name, bio, document_url,
    });
    res.status(201).json({ success: true, ...result });
  } catch (err) { next(err); }
}

/** PUT /api/v1/publisher/profile */
async function updateProfile(req, res, next) {
  try {
    const { display_name, bio, document_url } = req.body;
    const profile = await publisherProfileService.updateProfile(req.user.id, {
      display_name, bio, document_url,
    });
    res.json({ success: true, data: profile });
  } catch (err) { next(err); }
}

module.exports = { getProfile, applyAsPublisher, updateProfile };
