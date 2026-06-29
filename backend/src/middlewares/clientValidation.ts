import { Request, Response, NextFunction } from 'express';
import { applications } from '../utils/mockDb';

export const clientValidation = (req: Request, res: Response, next: NextFunction) => {
  const { appName, ownerId, appVersion } = req.body;

  if (!appName || !ownerId || !appVersion) {
    return res.status(400).json({ message: 'Validation failed: Missing appName, ownerId, or appVersion.' });
  }

  const app = applications.find(a => a.name === appName && a.ownerId === ownerId);

  if (!app) {
    return res.status(404).json({ message: 'Application not found or invalid credentials.' });
  }

  if (app.status === 'Paused') {
    return res.status(403).json({ message: 'Application is paused.' });
  }

  if (app.version !== appVersion) {
    return res.status(403).json({ message: 'Application version is outdated.' });
  }

  req.authApp = app;
  next();
};
