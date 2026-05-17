import mongoose from 'mongoose';
import { Project } from '../models/Project.js';

/**
 * Ensures :id refers to a project where req.user is an admin.
 * Admin means:
 * - owner, OR
 * - a member with role === 'admin'
 *
 * Sets req.project for downstream handlers.
 */
export async function requireProjectAdmin(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid project id' });
    }

    const project = await Project.findOne({
      _id: id,
      $or: [{ owner: req.user._id }, { members: { $elemMatch: { user: req.user._id, role: 'admin' } } }],
    });

    if (!project) {
      return res.status(403).json({ message: 'Admins only for this project' });
    }

    req.project = project;
    next();
  } catch (err) {
    console.error('requireProjectAdmin:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

