import { Router } from 'express';
import { handleKeyAuthRequest } from '../controllers/keyauthController';

const router = Router();

// The C++ KeyAuth SDK sends all requests as POST to a single endpoint
router.post('/', handleKeyAuthRequest);

export default router;
