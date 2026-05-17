import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import { User } from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

/** Shape of user sent to client (no password). */
function toPublicUser(userDoc) {
  return {
    id: userDoc._id.toString(),
    name: userDoc.name,
    email: userDoc.email,
  };
}

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 */
export async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      message: 'Account created',
      token,
      user: toPublicUser(user),
    });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ message: 'Server error during registration' });
  }
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
export async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    return res.json({
      message: 'Login successful',
      token,
      user: toPublicUser(user),
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ message: 'Server error during login' });
  }
}

/**
 * GET /api/auth/me
 * Header: Authorization: Bearer <token>
 */
export async function getMe(req, res) {
  try {
    return res.json({ user: toPublicUser(req.user) });
  } catch (err) {
    console.error('getMe error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
