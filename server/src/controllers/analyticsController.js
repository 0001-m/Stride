import mongoose from 'mongoose';
import { Project } from '../models/Project.js';
import { Task, TASK_STATUSES } from '../models/Task.js';

function isoDateOnly(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString().slice(0, 10);
}

function makeDayRange(days) {
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);

  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));

  const labels = [];
  for (let i = 0; i < days; i += 1) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    labels.push(isoDateOnly(d));
  }

  return { start, end, labels };
}

/**
 * GET /api/projects/:projectId/analytics
 *
 * Returns lightweight analytics for one project:
 * - team size
 * - task totals + status counts
 * - completion rate
 * - tasks created per day (last 14 days)
 */
export async function getProjectAnalytics(req, res) {
  try {
    const projectId = req.projectAccess?.id || req.params.projectId;
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'Invalid project id' });
    }

    const project = await Project.findById(projectId).select('name owner members').lean();
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const statusCountsAgg = await Task.aggregate([
      { $match: { project: new mongoose.Types.ObjectId(projectId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const statusCounts = Object.fromEntries(TASK_STATUSES.map((s) => [s, 0]));
    for (const row of statusCountsAgg) {
      if (row && typeof row._id === 'string' && typeof row.count === 'number') {
        statusCounts[row._id] = row.count;
      }
    }

    const totalTasks = Object.values(statusCounts).reduce((sum, n) => sum + n, 0);
    const doneTasks = statusCounts.done || 0;
    const completionRate = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

    const { start, labels } = makeDayRange(14);
    const createdAgg = await Task.aggregate([
      { $match: { project: new mongoose.Types.ObjectId(projectId), createdAt: { $gte: start } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const createdMap = new Map(createdAgg.map((r) => [r._id, r.count]));
    const tasksCreatedLast14Days = labels.map((date) => ({
      date,
      count: createdMap.get(date) || 0,
    }));

    const memberCount = Array.isArray(project.members) ? project.members.length : 0;
    const teamSize = 1 + memberCount; // owner + members

    return res.json({
      project: { id: String(project._id), name: project.name },
      stats: {
        teamSize,
        totalTasks,
        statusCounts,
        completionRate,
        tasksCreatedLast14Days,
      },
    });
  } catch (err) {
    console.error('getProjectAnalytics:', err);
    return res.status(500).json({ message: 'Failed to load analytics' });
  }
}

