import { Request, Response, NextFunction } from 'express';
import { applications } from '../utils/mockDb';
import { Application } from '../models/Application';
import { App } from '../models/App';

interface AuthRequest extends Request {
  authApp?: Application;
}

export const sellerAuth = async (req: Request, res: Response, next: NextFunction) => {
  const ownerId = req.headers['x-owner-id'] as string;
  const secret = req.headers['x-secret'] as string;

  if (!ownerId || !secret) {
    return res.status(401).json({ message: 'Authentication failed: Missing owner ID or secret.' });
  }

  let app = applications.find(app => app.ownerId === ownerId && app.secret === secret);

  if (!app) {
    try {
      const mongoApp = await App.findOne({ ownerId, secret }).select('-__v -createdBy -createdAt');
      if (mongoApp) {
        app = {
          id: (mongoApp._id as any).toString(),
          name: mongoApp.name,
          version: mongoApp.version,
          status: mongoApp.status as 'Active' | 'Paused',
          ownerId: mongoApp.ownerId,
          secret: mongoApp.secret,
        };
        applications.push(app);
      }
    } catch {}
  }

  if (!app) {
    return res.status(401).json({ message: 'Authentication failed: Invalid owner ID or secret.' });
  }

  (req as AuthRequest).authApp = app;
  next();
};
