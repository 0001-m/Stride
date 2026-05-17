import mongoose from 'mongoose';

const STATUS_VALUES = ['todo', 'in_progress', 'done'];

/**
 * Task belongs to a Project. Status values align with the Kanban board (Feature 6).
 */
const taskSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: STATUS_VALUES,
      default: 'todo',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

taskSchema.index({ project: 1, updatedAt: -1 });
taskSchema.index({ project: 1, status: 1, updatedAt: -1 });

export const Task = mongoose.model('Task', taskSchema);
export const TASK_STATUSES = STATUS_VALUES;
