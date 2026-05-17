import { Router } from 'express';
import { body, param } from 'express-validator';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { requireProjectOwner } from '../middleware/requireProjectOwner.js';
import { requireProjectAdmin } from '../middleware/requireProjectAdmin.js';
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  updateMemberRole,
} from '../controllers/projectController.js';

const router = Router();

router.use(protect);

const idParam = param('id').isMongoId().withMessage('Invalid project id');

const createValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 120 }),
  body('description').optional().isString().isLength({ max: 2000 }),
];

const updateValidation = [
  idParam,
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 120 }),
  body('description').optional().isString().isLength({ max: 2000 }),
];

const addMemberValidation = [
  idParam,
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
];

const removeMemberParams = [
  idParam,
  param('userId').isMongoId().withMessage('Invalid member id'),
];

const updateRoleValidation = [
  idParam,
  param('userId').isMongoId().withMessage('Invalid member id'),
  body('role').isIn(['admin', 'member']).withMessage('Role must be admin or member'),
];

router.get('/', listProjects);
router.post('/', createValidation, validateRequest, createProject);

// More specific /:id/members routes before /:id
router.post('/:id/members', addMemberValidation, validateRequest, requireProjectAdmin, addMember);
router.delete(
  '/:id/members/:userId',
  removeMemberParams,
  validateRequest,
  requireProjectAdmin,
  removeMember
);
router.put(
  '/:id/members/:userId/role',
  updateRoleValidation,
  validateRequest,
  requireProjectAdmin,
  updateMemberRole
);

router.get('/:id', idParam, validateRequest, getProject);
router.put('/:id', updateValidation, validateRequest, updateProject);
router.delete('/:id', idParam, validateRequest, requireProjectOwner, deleteProject);

export default router;
