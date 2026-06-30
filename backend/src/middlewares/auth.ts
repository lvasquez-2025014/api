import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev_only_secret');

export interface AuthRequest extends Request {
  user?: { id: string; username: string; role: 'owner' | 'seller' };
}

export const generateToken = (payload: { id: string; username: string; role: 'owner' | 'seller' }) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

const isProduction = process.env.NODE_ENV === 'production';

export const setTokenCookie = (res: Response, token: string) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
};

export const clearTokenCookie = (res: Response) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 0,
    path: '/',
  });
};

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token
    || req.headers.authorization?.replace('Bearer ', '');

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
