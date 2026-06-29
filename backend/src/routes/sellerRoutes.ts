import { Router } from 'express';
import { generateLicenses, getLicenses, getUsers } from '../controllers/sellerController';
import { sellerAuth } from '../middlewares/sellerAuth';

const router = Router();

router.post('/licenses/generate', sellerAuth, generateLicenses);
router.get('/licenses', sellerAuth, getLicenses);
router.get('/users', sellerAuth, getUsers);

export default router;
