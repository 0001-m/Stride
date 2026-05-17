import jwt from 'jsonwebtoken';

/**
 * Creates a signed JWT with the user id as the payload.
 * Expiry comes from JWT_EXPIRES_IN (e.g. "7d", "24h").
 */
export function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}
