import { Router } from 'express';
import { getServiceDetails, getServices } from '../controllers/serviceController';

const router = Router();

router.get('/', getServices);
router.get('/:externalId', getServiceDetails);
// router.post('/suggest', suggestService);

export default router;
