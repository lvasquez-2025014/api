import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'keyauth_clone_secret_2024';

export interface AuthRequest extends Request {
  user?: { id: string; username: string; role: 'owner' | 'seller' };
}

export const generateToken = (payload: { id: string; username: string; role: 'owner' | 'seller' }) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; username: string; role: 'owner' | 'seller' };
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const ownerOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'owner') {
    return res.status(403).json({ message: 'Owner access required' });
  }
  next();
};
