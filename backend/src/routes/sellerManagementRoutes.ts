import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Account } from '../models/Account';
import { App } from '../models/App';
import { authMiddleware, ownerOnly, AuthRequest } from '../middlewares/auth';

const router = Router();

router.use(authMiddleware, ownerOnly);

router.get('/', async (req, res) => {
  try {
    const sellers = await Account.find({ role: 'seller' }).select('-password -__v');
    const sellersWithApps = await Promise.all(sellers.map(async (s) => {
      const app = await App.findOne({ createdBy: s._id }).select('-__v -createdBy');
      return { ...s.toObject(), app: app || null };
    }));
    res.json({ sellers: sellersWithApps });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email and password are required' });
    }
    const existing = await Account.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const seller = await Account.create({ username, email, password: hashed, role: 'seller' });
    res.json({
      seller: {
        _id: seller._id,
        username: seller.username,
        email: seller.email,
        role: seller.role,
        createdAt: seller.createdAt,
      }
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/app', async (req, res) => {
  try {
    const seller = await Account.findOne({ _id: req.params.id, role: 'seller' });
    if (!seller) return res.status(404).json({ message: 'Seller not found' });

    const existingApp = await App.findOne({ createdBy: seller._id });
    if (existingApp) return res.status(400).json({ message: 'Seller already has an app' });

    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'App name is required' });

    const ownerId = crypto.randomBytes(5).toString('hex');
    const secret = crypto.randomBytes(32).toString('hex');

    const app = await App.create({
      name,
      ownerId,
      secret,
      version: '1.0',
      status: 'Active',
      createdBy: seller._id,
    });

    res.json({
      app: {
        _id: (app._id as any).toString(),
        name: app.name,
        ownerId: app.ownerId,
        secret: app.secret,
        version: app.version,
        status: app.status,
        createdAt: app.createdAt,
      }
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id/app', async (req, res) => {
  try {
    const seller = await Account.findOne({ _id: req.params.id, role: 'seller' });
    if (!seller) return res.status(404).json({ message: 'Seller not found' });

    const app = await App.findOne({ createdBy: seller._id }).select('-__v -createdBy');
    if (!app) return res.status(404).json({ message: 'No app for this seller yet' });

    res.json({ app });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await App.findOneAndDelete({ createdBy: req.params.id });
    const seller = await Account.findOneAndDelete({ _id: req.params.id, role: 'seller' });
    if (!seller) return res.status(404).json({ message: 'Seller not found' });
    res.json({ message: 'Seller deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
