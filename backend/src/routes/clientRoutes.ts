import { Router } from 'express';
import { initClient, registerClient, loginClient } from '../controllers/clientController';
import { clientValidation } from '../middlewares/clientValidation';

const router = Router();

router.post('/init', clientValidation, initClient);
router.post('/register', clientValidation, registerClient);
router.post('/login', clientValidation, loginClient);

export default router;
