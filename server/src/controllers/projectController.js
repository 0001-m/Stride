import mongoose from 'mongoose';
import { Project } from '../models/Project.js';
import { User } from '../models/User.js';

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/** Who can see a project in list/detail */
function visibilityFilter(userId) {
  return {
    $or: [{ owner: userId }, { 'members.user': userId }],
  };
}

function serializeMemberRow(entry) {
  const u = entry.user;
  const role = entry.role === 'admin' ? 'admin' : 'member';
  if (u && typeof u === 'object' && u._id) {
    return {
      userId: String(u._id),
      name: u.name,
      email: u.email,
      role,
      addedAt: entry.addedAt ? new Date(entry.addedAt).toISOString() : null,
    };
  }
  return {
    userId: String(entry.user),
    name: null,
    email: null,
    role,
    addedAt: entry.addedAt ? new Date(entry.addedAt).toISOString() : null,
  };
}

function serializeOwner(ownerField) {
  if (ownerField && typeof ownerField === 'object' && ownerField._id) {
    return {
      id: String(ownerField._id),
      name: ownerField.name,
      email: ownerField.email,
    };
  }
  return {
    id: String(ownerField),
    name: null,
    email: null,
  };
}

/**
 * @param {object} p — Mongoose doc or lean object
 * @param {{ includeMembers?: boolean, viewerId?: import('mongoose').Types.ObjectId }} opts
 */
function serializeProject(p, opts = {}) {
  const { includeMembers = false, viewerId = null } = opts;
  const ownerId = String(p.owner?._id ?? p.owner);
  const membersArr = Array.isArray(p.members) ? p.members : [];

  const base = {
    id: String(p._id),
    name: p.name,
    description: p.description || '',
    ownerId,
    memberCount: membersArr.length,
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : null,
    updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : null,
  };

  if (viewerId != null) {
    const isOwner = ownerId === String(viewerId);
    let role = 'member';
    if (isOwner) {
      role = 'admin';
    } else {
      const row = membersArr.find((m) => String(m.user?._id ?? m.user) === String(viewerId));
      role = row?.role === 'admin' ? 'admin' : 'member';
    }

    base.isOwner = isOwner;
    base.access = {
      role,
      canManageTeam: role === 'admin',
      canEditProject: role === 'admin',
      canDeleteProject: isOwner,
    };
  }

  if (includeMembers) {
    base.owner = serializeOwner(p.owner);
    base.members = membersArr.map(serializeMemberRow);
  }

  return base;
}

/**
 * GET /api/projects
 * Projects the user owns or is a member of.
 */
export async function listProjects(req, res) {
  try {
    const projects = await Project.find(visibilityFilter(req.user._id))
      .sort({ updatedAt: -1 })
      .lean();

    return res.json({
      projects: projects.map((p) => serializeProject(p, { viewerId: req.user._id })),
    });
  } catch (err) {
    console.error('listProjects:', err);
    return res.status(500).json({ message: 'Failed to load projects' });
  }
}

/**
 * GET /api/projects/:id
 * Owner or member; includes populated owner + members when found.
 */
export async function getProject(req, res) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid project id' });
    }

    const project = await Project.findOne({ _id: id, ...visibilityFilter(req.user._id) })
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    return res.json({
      project: serializeProject(project, { includeMembers: true, viewerId: req.user._id }),
    });
  } catch (err) {
    console.error('getProject:', err);
    return res.status(500).json({ message: 'Failed to load project' });
  }
}

/**
 * POST /api/projects
 */
export async function createProject(req, res) {
  try {
    const { name, description = '' } = req.body;

    const project = await Project.create({
      name: name.trim(),
      description: typeof description === 'string' ? description.trim() : '',
      owner: req.user._id,
      members: [],
    });

    return res.status(201).json({
      message: 'Project created',
      project: serializeProject(project, { viewerId: req.user._id }),
    });
  } catch (err) {
    console.error('createProject:', err);
    return res.status(500).json({ message: 'Failed to create project' });
  }
}

/**
 * PUT /api/projects/:id — owner only
 */
export async function updateProject(req, res) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid project id' });
    }

    const project = await Project.findOne({
      _id: id,
      $or: [{ owner: req.user._id }, { members: { $elemMatch: { user: req.user._id, role: 'admin' } } }],
    });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const { name, description = '' } = req.body;
    project.name = name.trim();
    project.description = typeof description === 'string' ? description.trim() : '';
    await project.save();

    return res.json({
      message: 'Project updated',
      project: serializeProject(project, { viewerId: req.user._id }),
    });
  } catch (err) {
    console.error('updateProject:', err);
    return res.status(500).json({ message: 'Failed to update project' });
  }
}

/**
 * DELETE /api/projects/:id — owner only
 */
export async function deleteProject(req, res) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid project id' });
    }

    const result = await Project.deleteOne({ _id: id, owner: req.user._id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    return res.json({ message: 'Project deleted' });
  } catch (err) {
    console.error('deleteProject:', err);
    return res.status(500).json({ message: 'Failed to delete project' });
  }
}

/**
 * POST /api/projects/:id/members
 * Body: { email } — owner invites an existing user by email.
 */
export async function addMember(req, res) {
  try {
    const project = req.project;
    const email = String(req.body.email || '')
      .toLowerCase()
      .trim();

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ message: 'No user found with that email' });
    }

    if (String(userToAdd._id) === String(project.owner)) {
      return res.status(400).json({ message: 'The owner is already part of this project' });
    }

    const already = project.members.some((m) => String(m.user) === String(userToAdd._id));
    if (already) {
      return res.status(409).json({ message: 'That user is already a member' });
    }

    project.members.push({ user: userToAdd._id, role: 'member', addedAt: new Date() });
    await project.save();

    const fresh = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    return res.status(201).json({
      message: 'Member added',
      project: serializeProject(fresh, { includeMembers: true, viewerId: req.user._id }),
    });
  } catch (err) {
    console.error('addMember:', err);
    return res.status(500).json({ message: 'Failed to add member' });
  }
}

/**
 * DELETE /api/projects/:id/members/:userId — owner removes a member
 */
export async function removeMember(req, res) {
  try {
    const project = req.project;
    const { userId } = req.params;

    if (String(userId) === String(project.owner)) {
      return res.status(400).json({ message: 'Cannot remove the project owner' });
    }

    const upd = await Project.updateOne(
      { _id: project._id, 'members.user': userId },
      { $pull: { members: { user: userId } } }
    );

    if (upd.matchedCount === 0) {
      return res.status(404).json({ message: 'Member not found on this project' });
    }

    const fresh = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    return res.json({
      message: 'Member removed',
      project: serializeProject(fresh, { includeMembers: true, viewerId: req.user._id }),
    });
  } catch (err) {
    console.error('removeMember:', err);
    return res.status(500).json({ message: 'Failed to remove member' });
  }
}

/**
 * PUT /api/projects/:id/members/:userId/role
 * Body: { role: 'admin' | 'member' }
 *
 * Admins can promote/demote members. The owner is always admin and cannot be changed here.
 */
export async function updateMemberRole(req, res) {
  try {
    const project = req.project;
    const { userId } = req.params;
    const role = req.body?.role === 'admin' ? 'admin' : req.body?.role === 'member' ? 'member' : null;
    if (!role) {
      return res.status(400).json({ message: 'Role must be admin or member' });
    }

    if (String(userId) === String(project.owner)) {
      return res.status(400).json({ message: 'Cannot change the owner role' });
    }

    const row = project.members.find((m) => String(m.user) === String(userId));
    if (!row) {
      return res.status(404).json({ message: 'Member not found on this project' });
    }

    row.role = role;
    await project.save();

    const fresh = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    return res.json({
      message: 'Member role updated',
      project: serializeProject(fresh, { includeMembers: true, viewerId: req.user._id }),
    });
  } catch (err) {
    console.error('updateMemberRole:', err);
    return res.status(500).json({ message: 'Failed to update member role' });
  }
}
