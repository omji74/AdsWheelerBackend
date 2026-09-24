import { Router } from 'express';
import {
  createAd,
  getAds,
  getAdById,
  updateAd,
  deleteAd
} from '../controllers/adController.js';

const router = Router();

router.post('/', createAd);
router.get('/', getAds);
router.get('/:id', getAdById);
router.put('/:id', updateAd);
router.delete('/:id', deleteAd);

export default router;
