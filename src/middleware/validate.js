const { validationResult } = require('express-validator');

// Wrap an array of express-validator checks. Runs them, then rejects with
// the same { message, errors } shape errorHandler.js already uses for
// Sequelize validation errors, so the frontend only has to handle one shape.
function validate(checks) {
  return [
    ...checks,
    (req, res, next) => {
      const result = validationResult(req);
      if (result.isEmpty()) return next();

      const errors = result.array().map((e) => e.msg);
      res.status(400).json({ message: 'Validation error', errors });
    },
  ];
}

module.exports = validate;
