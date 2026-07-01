import { Request, Response, NextFunction } from 'express';
import { applications } from '../utils/mockDb';

export const sellerAuth = (req: Request, res: Response, next: NextFunction) => {
  const ownerId = req.headers['x-owner-id'] as string;
  const secret = req.headers['x-secret'] as string;

  if (!ownerId || !secret) {
    return res.status(401).json({ message: 'Authentication failed: Missing owner ID or secret.' });
  }

  const app = applications.find(app => app.ownerId === ownerId && app.secret === secret);

  if (!app) {
    return res.status(401).json({ message: 'Authentication failed: Invalid owner ID or secret.' });
  }


  req.authApp = app;
  next();

};
