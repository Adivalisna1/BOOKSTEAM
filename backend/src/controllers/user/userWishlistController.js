const userWishlistService = require('../../services/user/userWishlistService');

/** GET /api/v1/user/wishlist */
async function getWishlist(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await userWishlistService.getWishlist(req.user.id, {
      page: parseInt(page, 10) || 1,
      limit: Math.min(parseInt(limit, 10) || 20, 50),
    });
    res.json({ success: true, data: result.wishlist, pagination: result.pagination });
  } catch (err) { next(err); }
}

/** POST /api/v1/user/wishlist/:bookId */
async function addToWishlist(req, res, next) {
  try {
    const result = await userWishlistService.addToWishlist(req.user.id, req.params.bookId);
    res.status(201).json({ success: true, ...result });
  } catch (err) { next(err); }
}

/** DELETE /api/v1/user/wishlist/:bookId */
async function removeFromWishlist(req, res, next) {
  try {
    const result = await userWishlistService.removeFromWishlist(req.user.id, req.params.bookId);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
