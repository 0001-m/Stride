import mongoose from 'mongoose';

export const PROJECT_ROLES = ['admin', 'member'];

/**
 * A project belongs to one owner (User). Team membership can extend this model later.
 */
const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    /** Collaborators (excludes owner). Each entry references a User. */
    members: {
      type: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
          },
          /**
           * RBAC role for this project.
           * - admin: can manage members + advanced actions
           * - member: can view and work on tasks
           *
           * Note: the owner is always treated as admin (even though they are not in members[]).
           */
          role: {
            type: String,
            enum: PROJECT_ROLES,
            default: 'member',
          },
          addedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

projectSchema.index({ 'members.user': 1 });

export const Project = mongoose.model('Project', projectSchema);
