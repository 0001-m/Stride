import { Router } from 'express';
import { body, param } from 'express-validator';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { requireProjectAccess } from '../middleware/requireProjectAccess.js';
import { listTasks, getTask, createTask, updateTask, deleteTask } from '../controllers/taskController.js';
import { TASK_STATUSES } from '../models/Task.js';

const router = Router({ mergeParams: true });

router.use(protect);
router.use(requireProjectAccess);

const taskIdParam = param('taskId').isMongoId().withMessage('Invalid task id');

const createValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').optional().isString().isLength({ max: 5000 }),
  body('status').optional().isIn(TASK_STATUSES),
];

const updateValidation = [
  taskIdParam,
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').optional().isString().isLength({ max: 5000 }),
  body('status').optional().isIn(TASK_STATUSES),
];

router.get('/', listTasks);
router.post('/', createValidation, validateRequest, createTask);
router.get('/:taskId', taskIdParam, validateRequest, getTask);
router.put('/:taskId', updateValidation, validateRequest, updateTask);
router.delete('/:taskId', taskIdParam, validateRequest, deleteTask);

export default router;
