import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireProjectAccess } from '../middleware/requireProjectAccess.js';
import { getProjectAnalytics } from '../controllers/analyticsController.js';

const router = Router({ mergeParams: true });

router.use(protect);
router.use(requireProjectAccess);

router.get('/', getProjectAnalytics);

export default router;

