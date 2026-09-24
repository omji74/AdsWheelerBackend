import { Router } from 'express';
import {
  createNotification,
  getNotifications,
  markNotificationRead,
  deleteNotification
} from '../controllers/notificationController.js';

const router = Router();

router.post('/', createNotification);
router.get('/', getNotifications);
router.patch('/:id/read', markNotificationRead);
router.delete('/:id', deleteNotification);

export default router;
