import { Router } from 'express';
import {
  createUser,
  getUsers,
  getUserById,
  updateDriverProfile,
  updatePublisherProfile
} from '../controllers/userController.js';

const router = Router();

router.post('/', createUser);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id/driver-profile', updateDriverProfile);
router.put('/:id/publisher-profile', updatePublisherProfile);

export default router;
