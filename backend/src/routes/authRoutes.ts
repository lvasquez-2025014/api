import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { Account } from '../models/Account';
import { generateToken, authMiddleware, AuthRequest } from '../middlewares/auth';

const router = Router();

router.post('/register', async (req, res) => {
  res.status(403).json({ message: 'Registration is disabled' });
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
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/me', authMiddleware, async (req: any, res) => {
  try {
    const account = await Account.findById(req.user?.id).select('-password');
    if (!account) return res.status(404).json({ message: 'User not found' });
    res.json({ user: account });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;
