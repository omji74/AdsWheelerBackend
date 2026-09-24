import { Router } from 'express';
import {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplicationStatus
} from '../controllers/applicationController.js';

const router = Router();

router.post('/', createApplication);
router.get('/', getApplications);
router.get('/:id', getApplicationById);
router.patch('/:id/status', updateApplicationStatus);

export default router;
