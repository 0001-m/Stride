import mongoose from 'mongoose';
import { Project } from '../models/Project.js';

/**
 * Ensures :projectId exists and the signed-in user is the owner or a member.
 * Sets req.projectAccess = { id, role, isOwner } for downstream handlers.
 */
export async function requireProjectAccess(req, res, next) {
  try {
    const projectId = req.params.projectId;
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'Invalid project id' });
    }

    const project = await Project.findOne({
      _id: projectId,
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
    })
      .select('_id owner members.user members.role')
      .lean();

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isOwner = String(project.owner) === String(req.user._id);
    let role = 'member';
    if (isOwner) {
      role = 'admin';
    } else if (Array.isArray(project.members)) {
      const row = project.members.find((m) => String(m.user) === String(req.user._id));
      role = row?.role === 'admin' ? 'admin' : 'member';
    }

    req.projectAccess = { id: project._id, role, isOwner };
    next();
  } catch (err) {
    console.error('requireProjectAccess:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
