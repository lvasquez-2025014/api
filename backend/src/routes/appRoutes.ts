import { Router } from 'express';
import crypto from 'crypto';
import { App } from '../models/App';
import { authMiddleware, ownerOnly, AuthRequest } from '../middlewares/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res) => {
  try {
    let apps;
    if (req.user!.role === 'owner') {
      apps = await App.find({});
    } else {
      apps = await App.find({ status: 'Active' });
    }
    res.json({ apps });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authMiddleware, ownerOnly, async (req: AuthRequest, res) => {
  try {
    const { name, version } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'App name is required' });
    }

    const ownerId = crypto.randomBytes(5).toString('hex');
    const secret = crypto.randomBytes(32).toString('hex');

    const app = await App.create({
      name,
      ownerId,
      secret,
      version: version || '1.0',
      createdBy: req.user!.id,
    });

    res.json({ app });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', authMiddleware, ownerOnly, async (req: AuthRequest, res) => {
  try {
    const { name, version, status } = req.body;
    const app = await App.findOneAndUpdate(
      { _id: req.params.id },
      { name, version, status },
      { new: true }
    );
    if (!app) return res.status(404).json({ message: 'App not found' });
    res.json({ app });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', authMiddleware, ownerOnly, async (req: AuthRequest, res) => {
  try {
    const app = await App.findOneAndDelete({ _id: req.params.id });
    if (!app) return res.status(404).json({ message: 'App not found' });
    res.json({ message: 'App deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
