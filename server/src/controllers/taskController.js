import mongoose from 'mongoose';
import { Task, TASK_STATUSES } from '../models/Task.js';

/** Escape user input before using inside a RegExp (for $regex). */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function serializeTask(doc) {
  const createdBy = doc.createdBy;
  let createdByOut = null;
  if (createdBy && typeof createdBy === 'object' && createdBy._id) {
    createdByOut = {
      id: String(createdBy._id),
      name: createdBy.name,
      email: createdBy.email,
    };
  } else if (doc.createdBy) {
    createdByOut = { id: String(doc.createdBy), name: null, email: null };
  }

  return {
    id: String(doc._id),
    projectId: String(doc.project),
    title: doc.title,
    description: doc.description || '',
    status: doc.status,
    createdBy: createdByOut,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
  };
}

/**
 * GET /api/projects/:projectId/tasks
 * Query: status (todo|in_progress|done), q or search (case-insensitive title/description, max 200 chars)
 */
export async function listTasks(req, res) {
  try {
    const projectId = req.projectAccess.id;

    const filter = { project: projectId };

    const statusRaw = typeof req.query.status === 'string' ? req.query.status.trim() : '';
    if (statusRaw && TASK_STATUSES.includes(statusRaw)) {
      filter.status = statusRaw;
    }

    const qRaw =
      typeof req.query.q === 'string'
        ? req.query.q
        : typeof req.query.search === 'string'
          ? req.query.search
          : '';
    const q = qRaw.trim().slice(0, 200);
    if (q.length > 0) {
      const pattern = escapeRegex(q);
      filter.$or = [
        { title: { $regex: pattern, $options: 'i' } },
        { description: { $regex: pattern, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(filter)
      .sort({ updatedAt: -1 })
      .populate('createdBy', 'name email')
      .lean();

    return res.json({ tasks: tasks.map((t) => serializeTask(t)) });
  } catch (err) {
    console.error('listTasks:', err);
    return res.status(500).json({ message: 'Failed to load tasks' });
  }
}

/**
 * GET /api/projects/:projectId/tasks/:taskId
 */
export async function getTask(req, res) {
  try {
    const { taskId } = req.params;
    const projectId = req.projectAccess.id;

    if (!isValidObjectId(taskId)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }

    const task = await Task.findOne({ _id: taskId, project: projectId })
      .populate('createdBy', 'name email')
      .lean();

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.json({ task: serializeTask(task) });
  } catch (err) {
    console.error('getTask:', err);
    return res.status(500).json({ message: 'Failed to load task' });
  }
}

/**
 * POST /api/projects/:projectId/tasks
 */
export async function createTask(req, res) {
  try {
    const projectId = req.projectAccess.id;
    const { title, description = '', status = 'todo' } = req.body;

    const task = await Task.create({
      project: projectId,
      title: title.trim(),
      description: typeof description === 'string' ? description.trim() : '',
      status,
      createdBy: req.user._id,
    });

    await task.populate('createdBy', 'name email');

    return res.status(201).json({
      message: 'Task created',
      task: serializeTask(task),
    });
  } catch (err) {
    console.error('createTask:', err);
    return res.status(500).json({ message: 'Failed to create task' });
  }
}

/**
 * PUT /api/projects/:projectId/tasks/:taskId
 */
export async function updateTask(req, res) {
  try {
    const { taskId } = req.params;
    const projectId = req.projectAccess.id;

    if (!isValidObjectId(taskId)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }

    const task = await Task.findOne({ _id: taskId, project: projectId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const { title, description = '', status } = req.body;
    task.title = title.trim();
    task.description = typeof description === 'string' ? description.trim() : '';
    if (status !== undefined) {
      task.status = status;
    }
    await task.save();
    await task.populate('createdBy', 'name email');

    return res.json({
      message: 'Task updated',
      task: serializeTask(task),
    });
  } catch (err) {
    console.error('updateTask:', err);
    return res.status(500).json({ message: 'Failed to update task' });
  }
}

/**
 * DELETE /api/projects/:projectId/tasks/:taskId
 */
export async function deleteTask(req, res) {
  try {
    if (req.projectAccess?.role !== 'admin') {
      return res.status(403).json({ message: 'Admins only: cannot delete tasks in this project' });
    }

    const { taskId } = req.params;
    const projectId = req.projectAccess.id;

    if (!isValidObjectId(taskId)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }

    const result = await Task.deleteOne({ _id: taskId, project: projectId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('deleteTask:', err);
    return res.status(500).json({ message: 'Failed to delete task' });
  }
}
