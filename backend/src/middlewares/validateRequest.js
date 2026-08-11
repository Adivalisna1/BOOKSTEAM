const { validationResult } = require('express-validator');

/**
 * Middleware that checks express-validator results and
 * returns 400 with error details if validation fails.
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
        value: err.value,
      })),
    });
  }

  next();
};

module.exports = { validateRequest };
