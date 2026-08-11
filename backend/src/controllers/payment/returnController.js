const returnService = require('../../services/payment/returnService');

/**
 * GET /api/v1/transactions/:id/return/check
 * Preview eligibility without committing the return.
 */
async function checkEligibility(req, res, next) {
  try {
    const result = await returnService.checkReturnEligibility(
      req.user.id,
      req.params.id
    );
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

/**
 * POST /api/v1/transactions/:id/return
 * Body: { reason? }
 * Processes the return — refunds to wallet, revokes library access.
 */
async function processReturn(req, res, next) {
  try {
    const result = await returnService.processReturn(
      req.user.id,
      req.params.id,
      req.body.reason
    );
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

module.exports = { checkEligibility, processReturn };
