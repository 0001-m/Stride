import mongoose from 'mongoose';
import { Project } from '../models/Project.js';

/**
 * Ensures :id refers to a project owned by req.user.
 * Sets req.project for downstream handlers (e.g. add/remove member).
 */
export async function requireProjectOwner(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid project id' });
    }

    const project = await Project.findOne({ _id: id, owner: req.user._id });
    if (!project) {
      return res.status(403).json({ message: 'Only the project owner can manage team members' });
    }

    req.project = project;
    next();
  } catch (err) {
    console.error('requireProjectOwner:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
