import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { Account } from '../models/Account';
import { generateToken } from '../middlewares/auth';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await Account.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const account = await Account.create({ username, email, password: hashed, role: 'seller' });

    const token = generateToken({ id: account._id.toString(), username: account.username, role: account.role });
    res.json({ token, user: { id: account._id, username: account.username, email: account.email, role: account.role } });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const account = await Account.findOne({ username });
    if (!account) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, account.password);
    if (!valid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({ id: account._id.toString(), username: account.username, role: account.role });
    res.json({ token, user: { id: account._id, username: account.username, email: account.email, role: account.role } });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', async (req: any, res) => {
  try {
    const { authMiddleware } = await import('../middlewares/auth');
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token' });

    const jwt = await import('jsonwebtoken');
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'keyauth_clone_secret_2024') as any;
    const account = await Account.findById(decoded.id).select('-password');
    if (!account) return res.status(404).json({ message: 'User not found' });
    res.json({ user: account });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;
