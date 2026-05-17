import { validationResult } from 'express-validator';

/**
 * Runs after express-validator chains; returns 400 if any check failed.
 */
export function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  next();
}
